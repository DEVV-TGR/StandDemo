# 04 — Segurança

> **Aplica-se a** — credenciais, limites de pedidos, e o que fica exposto ao browser.
> **Fonte de verdade** — este documento; `src/lib/r2.ts` e `src/db/index.ts` do PR #12 como referência do padrão.
> **Ler antes de** — acrescentar qualquer variável de ambiente ou endpoint novo.

## Segredos nunca chegam ao browser

Esta é a regra que não se negoceia. As chaves do Neon, do R2 e do Resend dão acesso total aos dados, às fotos e ao envio de email em nome do domínio.

### A regra do prefixo

No Next.js, **qualquer variável com o prefixo `NEXT_PUBLIC_` é embutida no JavaScript enviado ao browser** e fica visível a quem abrir as ferramentas de programador. Não é preciso ser atacante: basta abrir o código-fonte da página.

**Nenhuma variável deste projeto leva esse prefixo.** Se alguma vez for preciso um valor no cliente, esse valor não é um segredo — e essa é a pergunta a fazer antes de o expor.

### A rede de proteção: `server-only`

Os módulos que tocam em credenciais importam o pacote `server-only` na primeira linha:

```ts
import "server-only";   // src/db/index.ts, src/lib/r2.ts, src/lib/viaturas.ts
```

Isto não é decoração. Se alguém — pessoa ou agente — importar um destes módulos a partir de um componente com `"use client"`, **o build falha com erro**, em vez de compilar e enviar as chaves para o browser. É a diferença entre um erro em desenvolvimento e uma fuga em produção.

Ao criar um módulo novo que leia `process.env`, pôr o `server-only` no topo.

### Fotos

O upload passa por server action (`uploadFotos` no #12): o ficheiro sobe ao servidor, o servidor fala com o R2. **As chaves do R2 nunca saem do servidor.**

A única variável relacionada que é pública é o `R2_PUBLIC_URL`, e por natureza — é o endereço de onde o browser carrega as imagens. Dá acesso de leitura a ficheiros que já são públicos. Nunca dá escrita.

Não usar URLs pré-assinados de upload direto do browser sem repensar isto: mudaria quem controla o que é escrito no bucket.

## Limites de pedidos

Sem limites, um formulário de login é um convite: tentativas ilimitadas de palavra-passe, e um botão que envia emails à custa da tua quota.

| Ação | Limite | Porquê |
|---|---|---|
| Email + palavra-passe | 5 tentativas / 15 min por IP | Trava a força bruta |
| Pedido de código | 3 / 15 min por conta | Protege a caixa de correio e a quota do Resend |
| Verificação do código | 1 tentativa, depois 5 min | Regra definida em [03](03-autenticacao.md) |
| Server actions do painel | 60 / min por sessão | Rede de segurança contra um script descontrolado |

### Onde guardar a contagem

**Numa tabela da base de dados, não em Redis.** Evita mais um serviço e mantém o custo em zero, coerente com o resto das escolhas. O volume é ínfimo — uma conta, alguns acessos por semana.

```ts
export const tentativasAcesso = pgTable("tentativas_acesso", {
  id: text("id").primaryKey(),
  chave: text("chave").notNull(),        // "ip:1.2.3.4" | "conta:<id>"
  acao: text("acao").notNull(),          // "password" | "codigo" | "envio"
  ocorridoEm: timestamp("ocorrido_em", { withTimezone: true }).notNull().defaultNow(),
  bloqueadoAte: timestamp("bloqueado_ate", { withTimezone: true }),
});
```

Contar as ocorrências dentro da janela e comparar com o limite. Limpar as antigas de vez em quando — na mesma passagem em que se limpam os códigos expirados.

**Limitação a assumir:** o IP vem de cabeçalhos (`x-forwarded-for`) e pode ser forjado ou partilhado por vários utilizadores atrás do mesmo NAT. Por isso os limites por IP são a primeira barreira, e não a única — o bloqueio que conta a sério é o da conta.

## Superfície de ataque

O que existe, exposto à internet, e o que o protege:

| Ponto | Protegido por |
|---|---|
| `/admin/login` | Limites por IP, mensagens genéricas, bcrypt |
| Passo do código | Código com hash, uso único, validade, tentativa única, bloqueio |
| `/admin/(painel)/*` | Gate de sessão no layout |
| Server actions de CRUD | `exigirSessao()` na primeira linha de **cada** uma |
| Upload de fotos | Sessão + tipos de imagem numa lista fechada |
| Site público | Só leitura; não toca em credenciais de escrita |

O ponto mais fácil de esquecer é a server action. São endpoints HTTP reais, invocáveis diretamente com um pedido bem formado, **sem passar pelo layout que protege a página**. Uma action sem verificação de sessão é uma porta aberta, por muito bem fechada que a página esteja.

## Upload de ficheiros

O `uploadFoto` do #12 já tem o essencial:

- **Lista fechada de tipos** (`image/jpeg`, `png`, `webp`, `avif`, `gif`); qualquer outro é rejeitado.
- **Nome gerado no servidor** com `randomUUID()` — o nome que o utilizador deu nunca chega ao bucket, o que evita travessia de caminhos e colisões.
- **Extensão derivada do tipo declarado**, não do nome do ficheiro.

Falta acrescentar na reintegração: **limite de tamanho por ficheiro** (sugestão: 8 MB) e **de número de fotos por viatura** (sugestão: 30). Sem isso, um erro do cliente enche o bucket.

## Registo de acessos

Guardar quem entrou e quando, e as tentativas falhadas. Para uma conta única, `tentativas_acesso` já serve — mas nunca registar o código nem a palavra-passe, nem sequer parcialmente.

## Nunca

- **Usar o prefixo `NEXT_PUBLIC_`** numa credencial. Se precisa de estar no cliente, não é segredo.
- **Criar um módulo que leia `process.env` sem `server-only`** no topo.
- **Escrever uma server action sem verificar a sessão** logo na primeira linha.
- **Enviar chaves do R2 para o browser**, nem com upload direto.
- **Deixar um endpoint de login ou de envio de email sem limite de pedidos.**
- **Aceitar upload sem lista fechada de tipos e sem limite de tamanho.**
- **Registar códigos ou palavras-passe** em logs, mesmo truncados.
- **Confiar no IP como única identidade** — pode ser forjado ou partilhado.
