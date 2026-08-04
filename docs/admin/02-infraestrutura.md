# 02 — Infraestrutura

> **Aplica-se a** — os serviços externos, o seu setup e o que custam.
> **Fonte de verdade** — este documento; o `.env.example` do PR #12 (`git show bf14fed:.env.example`).
> **Ler antes de** — criar contas, configurar a Vercel ou fazer o primeiro deploy.

Quatro peças. Custo ~0 €/mês além do plano Vercel que já pagas.

| Peça | Serviço | Papel |
|---|---|---|
| Base de dados | **Neon** (Postgres) | Viaturas e contas de acesso |
| Fotos | **Cloudflare R2** | Imagens dos anúncios (S3-compatível) |
| Email | **Resend** | Envio dos códigos de acesso |
| Alojamento | **Vercel** | Corre a aplicação Next.js |

As credenciais vivem em variáveis de ambiente. **Nunca commitar o `.env.local`** — já está no `.gitignore`.

---

## 1. Neon — base de dados

**Modelo de conta:** Conta → Organização (define o plano e a fatura) → Projetos (cada um é uma base isolada). O tier está ligado à organização, não ao domínio nem à conta Vercel.

**Tier grátis, por projeto:**
- 0,5 GB de armazenamento — muitíssimo para texto de viaturas
- Até **100 projetos** → uma base isolada por cliente, sem custo
- A computação adormece após 5 minutos sem uso e acorda no primeiro pedido (~0,5 s)
- Permanente, não é período experimental, e não pede cartão

**Setup:**
1. [neon.com](https://neon.com) → *New Project*, região europeia (ex.: Frankfurt)
2. *Connection Details* → copiar a connection string, com `?sslmode=require`
3. Colar em `DATABASE_URL` no `.env.local` e, mais tarde, na Vercel

**Criar tabelas e dados iniciais:**
```bash
npm run db:push     # cria as tabelas a partir de src/db/schema.ts
npm run db:seed     # insere as viaturas de exemplo + a 1ª conta de acesso
```

O adormecimento tem uma consequência prática: a primeira visita ao site depois de horas de inatividade paga ~0,5 s a mais. Para um stand é irrelevante, mas convém saber antes de investigar um "site lento".

---

## 2. Cloudflare R2 — fotos

**Tier grátis:** 10 GB de armazenamento, 1 milhão de escritas e 10 milhões de leituras por mês, e **tráfego de saída sem custo** — é o que torna o R2 mais barato que o S3 para servir imagens.

Ordem de grandeza: 30 viaturas × 15 fotos otimizadas (~300 KB) ≈ 135 MB. Cabem centenas de stands nos 10 GB.

**Setup:**
1. Cloudflare → **R2** → *Create bucket* (ex.: `imperio-fotos`) → `R2_BUCKET`
2. *Manage R2 API Tokens* → criar token de leitura/escrita → `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`
3. Account ID (no canto do painel R2) → `R2_ACCOUNT_ID`
4. Tornar as fotos públicas, à escolha:
   - **Domínio próprio:** bucket → *Settings* → *Custom Domain* (ex.: `cdn.exemplo.pt`)
   - **Rápido:** bucket → *Settings* → ativar o subdomínio `r2.dev` (ex.: `https://pub-xxxx.r2.dev`)

   O URL escolhido vai para `R2_PUBLIC_URL`.

O `next.config.ts` do PR #12 já autoriza o `<Image>` a carregar de `*.r2.dev`, `*.r2.cloudflarestorage.com` e do host de `R2_PUBLIC_URL`.

---

## 3. Resend — envio dos códigos

**Tier grátis:** 3 000 emails/mês e 100/dia. O painel envia um email por tentativa de acesso — a folga é enorme.

**Setup:**
1. [resend.com](https://resend.com) → criar conta → *API Keys* → `RESEND_API_KEY`
2. Endereço de origem, à escolha:
   - **Com domínio próprio:** *Domains* → adicionar o domínio do site → configurar os registos DNS (SPF, DKIM) → enviar de `acesso@dominio.pt`
   - **Sem domínio, para testes:** usar `onboarding@resend.dev`, que funciona sem verificação mas **só envia para o email registado na conta Resend**

O endereço de origem vai para `EMAIL_REMETENTE`.

**A ter em conta:** enquanto o domínio não estiver verificado, o envio para o Gmail do cliente não funciona com `onboarding@resend.dev`. Verificar o domínio é passo obrigatório antes de entregar o painel ao cliente — não deixar para o fim.

---

## 4. Vercel — alojamento

**Plano Pro:** ~20 $/mês por membro, projetos ilimitados e uso comercial permitido. Uma conta Pro aloja muitos sites de clientes. Incluído: 1 TB de tráfego e 10 milhões de pedidos edge por mês — um site de stand não chega perto.

**Deploy:**
1. Importar o repositório (a Vercel deteta Next.js)
2. *Settings → Environment Variables*: colar todas as variáveis, **menos as `SEED_ADMIN_*`**, que só servem para o seed local
3. Deploy, e ligar o domínio em *Settings → Domains*
4. Correr o seed uma vez contra a base de produção, localmente, com o `DATABASE_URL` de produção no `.env.local`:
   ```bash
   npm run db:push && npm run db:seed
   ```

---

## Variáveis de ambiente

Lista completa para o `.env.example`. **Nenhuma leva o prefixo `NEXT_PUBLIC_`** — ver [04 — Segurança](04-seguranca.md).

```bash
# Base de dados Neon — Connection Details → Connection string (com ?sslmode=require)
DATABASE_URL="postgresql://utilizador:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Segredo para assinar as sessões. Gerar com: npx auth secret
AUTH_SECRET="cole-aqui-um-segredo-aleatorio"

# Cloudflare R2 — fotos
R2_ACCOUNT_ID="o-seu-account-id-cloudflare"
R2_ACCESS_KEY_ID="a-sua-access-key"
R2_SECRET_ACCESS_KEY="a-sua-secret-key"
R2_BUCKET="nome-do-bucket"
R2_PUBLIC_URL="https://pub-xxxx.r2.dev"

# Resend — envio dos códigos de acesso
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_REMETENTE="acesso@dominio.pt"

# Quem pode aceder ao painel (ver 03 — Autenticação)
ADMIN_EMAIL_PERMITIDO="imperioautoconcept@gmail.com"

# --- Só para o seed local (npm run db:seed); não definir na Vercel ---
SEED_ADMIN_EMAIL="imperioautoconcept@gmail.com"
SEED_ADMIN_PASSWORD="troque-esta-password"
```

## Dependências que entram

Do `package.json` do PR #12, mais o Resend:

```
@neondatabase/serverless   drizzle-orm   drizzle-kit   tsx
@aws-sdk/client-s3         next-auth     bcryptjs      zod
resend
```

Scripts: `db:generate`, `db:push`, `db:migrate`, `db:seed`.

## Custos por cenário

| Cenário | Neon | R2 | Resend | Vercel | **Total/mês** |
|---|---|---|---|---|---|
| 1 cliente com gestão | grátis | grátis | grátis | 20 $ | **~20 $** |
| 5 clientes, bases isoladas | grátis¹ | grátis | grátis | 20 $ | **~20 $** |
| Cliente só montra, sem gestão | — | — | — | partilha os 20 $ | **~0 $ marginal** |

¹ O tier grátis do Neon vai até 100 projetos. Só há custo se um projeto passar 0,5 GB ou esgotar as horas de computação — improvável num stand; nesse caso passa ao plano por utilização.

**Comparação:** a alternativa gerida (Supabase) custaria 25 $/mês de base mais ~10 $/mês por cliente isolado. Esta combinação troca essa conveniência por custo praticamente nulo, ao montar as peças e trazer o acesso para dentro da própria aplicação.

O que cobras ao cliente pela gestão é margem, independente destes custos.

## Isolamento por cliente

O molde reutiliza-se assim: **um projeto Neon e um bucket R2 por cliente**, com o mesmo código. Nada é partilhado entre clientes — nem dados, nem fotos, nem contas de acesso. Se um cliente sair, apaga-se o projeto e o bucket.

## Nunca

- **Commitar o `.env.local`** ou colar credenciais em ficheiros versionados.
- **Definir as `SEED_ADMIN_*` na Vercel** — só servem para o seed local.
- **Partilhar a mesma base ou o mesmo bucket entre clientes.**
- **Entregar o painel ao cliente com o domínio do Resend por verificar** — os emails não chegam.
- **Esquecer o `?sslmode=require`** na connection string do Neon.
