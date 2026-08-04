# 03 — Autenticação

> **Aplica-se a** — o acesso ao painel: quem entra, como, e o que acontece quando falha.
> **Fonte de verdade** — este documento. O PR #12 tem só o primeiro passo (`git show bf14fed:src/auth.ts`).
> **Ler antes de** — implementar o login ou mexer em qualquer coisa dentro de `/admin`.

## O que muda face ao PR #12

O #12 tinha **só palavra-passe** — Auth.js com `Credentials` e bcrypt. Funciona, mas basta a palavra-passe para entrar.

Passa a haver **dois fatores**: algo que o cliente sabe (palavra-passe) e algo que recebe (código no email). A parte da palavra-passe reaproveita-se quase toda; o segundo passo é novo.

## Fluxo

```
1.  Email + palavra-passe
        ↓ bcrypt.compare contra admin_users
        ✗ → erro genérico ("credenciais inválidas")
        ✓
2.  Gerar código de 6 dígitos
        · guardar o HASH do código, com validade
        · enviar por Resend para o email da conta
        ↓
3.  Inserir o código
        ✗ → consome a tentativa → bloqueio de 5 minutos
        ✓ → marcar como consumido → criar sessão → /admin
```

O segundo passo só arranca **depois** de a palavra-passe estar correta. Um atacante que não saiba a palavra-passe nunca faz o sistema enviar emails — o que protege a caixa de correio do cliente e a quota do Resend.

## Quem pode entrar

Apenas `imperioautoconcept@gmail.com`. Duas barreiras, de propósito:

1. A tabela `admin_users` tem uma linha só.
2. `ADMIN_EMAIL_PERMITIDO` verifica o endereço antes de qualquer consulta à base.

A segunda existe para que, mesmo que alguém insira uma linha na base por engano, o acesso continue fechado. Acrescentar um segundo utilizador é uma decisão deliberada, com alteração da variável.

## Parâmetros

Todos numa constante única, para se afinarem sem andar à caça de números pelo código:

```ts
// src/lib/auth-config.ts
export const AUTENTICACAO = {
  CODIGO_DIGITOS: 6,
  CODIGO_VALIDADE_MIN: 10,      // tempo para ir ao email sem pressa
  CODIGO_TENTATIVAS: 1,         // pedido do cliente: falha → bloqueio
  BLOQUEIO_MIN: 5,              // duração do bloqueio após falhar
  SESSAO_DIAS: 7,
} as const;
```

| Parâmetro | Valor | Razão |
|---|---|---|
| Dígitos do código | 6 | Fácil de copiar do telemóvel; 1 em 1 000 000 por tentativa |
| Validade | 10 minutos | Chega para abrir o email sem correr |
| Tentativas | **1** | Pedido explícito do cliente |
| Bloqueio | **5 minutos** | Pedido explícito do cliente |
| Reutilização | Nunca | Uso único: consumido ao validar |
| Sessão | 7 dias | Cómodo para uso semanal, curto o suficiente |

**Nota sobre a tentativa única.** É severo: um dígito trocado custa 5 minutos de espera. Foi pedido assim e assim fica, mas ficou registada a hipótese de o cliente se enganar com frequência — nesse caso passa-se `CODIGO_TENTATIVAS` para 3 num sítio só, sem mais alterações. Na interface, mostrar o aviso **antes** de submeter: *"Tem uma tentativa. Se o código estiver errado, terá de esperar 5 minutos."*

## Armazenamento do código

O código **nunca é guardado em texto simples** — quem lesse a base entraria sem passar pelo email.

Tabela nova:

```ts
export const codigosAcesso = pgTable("codigos_acesso", {
  id: text("id").primaryKey(),
  utilizadorId: text("utilizador_id").notNull().references(() => adminUsers.id),
  codigoHash: text("codigo_hash").notNull(),        // bcrypt
  expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
  consumidoEm: timestamp("consumido_em", { withTimezone: true }),
  tentativas: integer("tentativas").notNull().default(0),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});
```

Regras:

- Gerar com `crypto.randomInt(0, 1_000_000)` e formatar com zeros à esquerda — **nunca `Math.random()`**, que é previsível.
- Comparar com `bcrypt.compare`, nunca com `===`.
- Emitir um código novo **invalida** os anteriores por consumir da mesma conta. Sem códigos válidos em paralelo.
- Um código validado é marcado com `consumidoEm` e nunca mais serve, mesmo dentro da validade.
- Limpar periodicamente os expirados — uma limpeza simples ao gerar um código novo chega.

## Bloqueio

Ao falhar, regista-se o bloqueio na tabela de tentativas (ver [04 — Segurança](04-seguranca.md)). Enquanto durar:

- Não se aceita código, nem se gera um novo, nem se aceita palavra-passe para aquela conta.
- A interface mostra **quanto tempo falta**, em contagem decrescente, e não apenas "bloqueado". O cliente tem de perceber que é uma espera e não uma avaria.
- O bloqueio é por conta, não por IP — a conta é uma só, e prender por IP deixaria o cliente de fora se mudasse de rede.

## Mensagens de erro

Não revelar o que existe. A resposta ao email errado e à palavra-passe errada é a mesma:

> Credenciais inválidas.

Nunca "esse email não existe" nem "a palavra-passe está errada" — cada uma dessas confirma metade do segredo. Já a mensagem do código pode ser específica ("Código incorreto" / "Código expirado"), porque nessa altura a identidade já foi provada.

## Sessão

Auth.js com estratégia JWT, como no #12. O cookie:

| Atributo | Valor |
|---|---|
| `httpOnly` | sim — JavaScript não lhe toca |
| `secure` | sim em produção |
| `sameSite` | `lax` |
| Validade | 7 dias |

A sessão só é criada **no fim do segundo passo**. Entre os dois passos existe um estado intermédio — palavra-passe validada, código por confirmar — que **não é uma sessão** e não dá acesso a nada. Guardá-lo num cookie curto e assinado, ou na própria linha de `codigos_acesso`; nunca num campo escondido do formulário.

## Verificação em profundidade

Duas camadas, e as duas são obrigatórias:

1. **Gate no layout** — `src/app/admin/(painel)/layout.tsx` chama `auth()` e redireciona para `/admin/login` se não houver sessão.
2. **Verificação em cada server action** — o #12 já o faz com `exigirSessao()`, chamada no início de `criarViatura`, `atualizarViatura`, `apagarViatura` e `uploadFotos`.

A segunda não é redundante: as server actions são endpoints HTTP reais e podem ser invocadas diretamente, sem passar pelo layout. **Uma server action sem verificação de sessão é uma porta aberta**, por muito protegida que a página esteja.

## Terminar sessão

Botão "Sair" sempre visível no cabeçalho do painel — já existe no #12. Ao sair, invalidar o cookie.

## Nunca

- **Guardar o código em texto simples**, nem compará-lo com `===`.
- **Usar `Math.random()`** para gerar o código.
- **Reaproveitar um código já usado**, mesmo dentro da validade.
- **Enviar email antes de a palavra-passe estar correta.**
- **Dizer se o email existe** ou distinguir "email errado" de "palavra-passe errada".
- **Escrever uma server action sem `exigirSessao()`** logo na primeira linha.
- **Dar acesso ao painel com a palavra-passe validada mas o código por confirmar.**
- **Mostrar "bloqueado" sem dizer quanto falta.**
