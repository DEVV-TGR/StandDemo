# 06 — Reintegração

> **Aplica-se a** — a execução, quando chegar a altura de construir.
> **Fonte de verdade** — o commit `bf14fed` (PR #12) e os documentos `01` a `05` desta pasta.
> **Ler antes de** — escrever a primeira linha de código do painel.

## Ponto de partida

O painel já existe em `bf14fed`. Recuperar um ficheiro:

```bash
git show bf14fed:src/db/schema.ts > src/db/schema.ts
git show --stat --format="" bf14fed        # os 46 ficheiros do PR
```

Antes de escrever algo de novo, **verificar sempre se já existe ali**.

## Mapa do que se recupera

| Ficheiro | Linhas | Ação |
|---|---|---|
| `src/db/schema.ts` | 67 | **Recuperar** e acrescentar `codigos_acesso` e `tentativas_acesso` |
| `src/db/index.ts` | 34 | **Recuperar**; a ligação preguiçosa mantém-se |
| `src/db/seed.ts` | 102 | **Recuperar** |
| `src/db/load-env.ts` | 26 | Recuperar tal e qual |
| `drizzle.config.ts` + `drizzle/` | ~390 | Recuperar; regerar a migração com as tabelas novas |
| `src/lib/viaturas.ts` | 97 | **Adaptar** — acrescentar o recurso ao estático ([01](01-arquitetura.md)) |
| `src/lib/derivados.ts` | 106 | **Recuperar** a versão de funções puras |
| `src/lib/r2.ts` | 85 | Recuperar; acrescentar limites de tamanho e quantidade |
| `src/lib/viatura-schema.ts` | 68 | Recuperar tal e qual |
| `src/lib/slug.ts` | 19 | Recuperar o `slugify()` que o #12 acrescentou |
| `src/app/admin/actions.ts` | 96 | Recuperar; manter o `exigirSessao()` em todas |
| `src/auth.ts` | 43 | **Reescrever** — é só o 1.º passo; falta o código por email ([03](03-autenticacao.md)) |
| `src/app/admin/login/*` | 103 | **Reescrever** — passa a ter dois ecrãs |
| `src/app/admin/(painel)/layout.tsx` | 51 | Recuperar |
| `src/app/admin/(painel)/page.tsx` | 140 | **Adaptar** — ícones em vez de texto, cartões no telemóvel ([05](05-painel-ux.md)) |
| `src/app/admin/(painel)/AcoesViatura.tsx` | 47 | **Adaptar** — lápis e caixote |
| `src/components/admin/ViaturaForm.tsx` | **709** | **Recuperar quase intacto** — acrescentar as frases de efeito nos controlos de publicação |
| `src/app/(site)/*` | — | Recuperar a reorganização em grupos de rotas |
| `.env.example` | 28 | Recuperar e acrescentar as variáveis do Resend ([02](02-infraestrutura.md)) |
| `docs/INFRAESTRUTURA.md` | 135 | Já absorvido em [02](02-infraestrutura.md) |

**Novo, sem base no #12:** o segundo passo do login, o envio por Resend, as duas tabelas de acesso, e a limitação de pedidos.

## Fases

Ordenadas por dependência. Cada uma acaba num estado verificável.

### Fase 1 — Base de dados
Recuperar `src/db/*`, `drizzle.config.ts` e os scripts do `package.json`. Acrescentar `codigos_acesso` e `tentativas_acesso`. Instalar as dependências.

*Pronto quando:* `npm run db:push` cria as tabelas no Neon e `npm run db:seed` insere as 6 viaturas e a conta de acesso.

### Fase 2 — Camada de leitura com recurso ao estático
Recuperar `src/lib/viaturas.ts` e acrescentar `temBaseDeDados()`. Passar `derivados.ts` a funções puras. Trocar os `import { viaturas }` dos componentes pelas funções de leitura.

*Pronto quando:* **sem `DATABASE_URL`, o site continua a funcionar** com os dados estáticos; com a variável definida, mostra o que está na base. Esta é a fase que evita repetir o revert — não avançar sem a confirmar nos dois sentidos.

### Fase 3 — Reorganização das rotas
Mover o site para o grupo `(site)`. Criar o esqueleto de `/admin` sem chrome.

*Pronto quando:* o site está igual ao que estava, e `/admin` responde sem Header nem Footer.

### Fase 4 — Autenticação
Implementar os dois passos de [03](03-autenticacao.md): palavra-passe, geração e envio do código, verificação, bloqueio. Configurar o Resend. Gate no layout e `exigirSessao()` nas actions.

*Pronto quando:* o acesso com credenciais certas envia o código e entra; o código errado bloqueia 5 minutos com contagem visível; o código não serve duas vezes; uma server action chamada sem sessão é recusada.

### Fase 5 — Painel
Listagem com ícones e cartões no telemóvel; formulário; server actions de criar, editar e apagar.

*Pronto quando:* dá para criar, editar e apagar uma viatura, e o site reflete cada alteração.

### Fase 6 — Fotos
Upload para o R2, remoção, reordenação, com os limites definidos.

*Pronto quando:* uma viatura criada de raiz no painel, com fotos carregadas, aparece correta no site — card, galeria e detalhe.

### Fase 7 — Limites e deploy
Limitação de pedidos, verificação do domínio no Resend, variáveis na Vercel, seed contra a base de produção.

*Pronto quando:* o painel funciona no domínio real e os limites disparam quando devem.

## Verificar depois de tudo

A propagação automática descrita em [01](01-arquitetura.md) é o que o cliente vai usar. Confirmar uma a uma:

- Criar viatura de marca nova → a marca aparece na grelha da homepage
- Apagar a última viatura de uma marca → a marca desaparece
- Ligar o destaque → entra em "Viaturas em Destaque"; desligar → sai
- Marcar como reservado → badge dourado no card
- Marcar como vendido → badge vermelho, foto sem cor, preço a dizer "Vendido"
- Alterar um preço → os limites do filtro de preço acompanham

## O que só se testa com credenciais reais

**O CRUD ponta a ponta nunca foi testado contra Neon e R2 vivos** — nem sequer no PR #12, como ficou registado na altura. Contar com isso: a primeira ligação real vai revelar problemas que não aparecem localmente. Candidatos prováveis: o adormecimento do Neon no primeiro pedido, permissões do token R2, o domínio do Resend por verificar, e o comportamento das server actions no ambiente da Vercel.

Reservar tempo para essa fase em vez de a tratar como formalidade final.

## Nunca

- **Escrever de raiz o que já está em `bf14fed`.** Consultar o mapa primeiro.
- **Avançar da Fase 2 sem confirmar que o site corre sem base de dados.**
- **Reaproveitar o `src/auth.ts` do #12 como está** — só cobre metade do acesso.
- **Deixar a limitação de pedidos para depois do deploy.**
- **Assumir que o que funciona localmente funciona contra os serviços reais.**
