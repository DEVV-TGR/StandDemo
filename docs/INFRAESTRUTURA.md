# Infraestrutura — StandDemo / Painel de gestão

Guia da infraestrutura que suporta o painel `/admin` (gerir viaturas sem código,
a partir de qualquer dispositivo). Serve também de referência para **reutilizar
o sistema noutros clientes**.

Stack escolhida (custo ~$0/mês para começar, além do plano Vercel):

| Peça | Serviço | Papel |
|---|---|---|
| Base de dados | **Neon** (Postgres) | Guarda as viaturas e os utilizadores admin |
| Fotos | **Cloudflare R2** | Armazena as imagens (S3-compatível) |
| Login | **Auth.js** (na app) | Email + palavra-passe, sessão por cookie |
| Alojamento | **Vercel** | Corre o site Next.js |

> As credenciais vivem em variáveis de ambiente. Ver `.env.example` para a lista
> completa. **Nunca** commitar o `.env.local` (já está no `.gitignore`).

---

## 1. Neon — base de dados (Postgres)

**Modelo de conta:** Conta → **Organização** (define o *plano* e a *fatura*) →
**Projetos** (cada um é uma base de dados isolada). O tier **não** está ligado ao
domínio nem à conta Vercel — está ligado à organização Neon (o teu email).

**Tier grátis (por projeto):**
- 0,5 GB de armazenamento — muito para dados de texto de viaturas.
- Até **100 projetos** → uma base isolada por cliente, de graça.
- A computação **adormece** após 5 min sem uso e acorda no 1º pedido (~0,5 s).
- **Permanente** (não é trial), sem cartão. Os dados persistem.

**Criar o projeto e obter o `DATABASE_URL`:**
1. [neon.com](https://neon.com) → *New Project* (região europeia, ex.: Frankfurt).
2. *Connection Details* → copiar a **Connection string** (com `?sslmode=require`).
3. Colar em `DATABASE_URL` no `.env.local` (e depois na Vercel).

**Criar as tabelas e dados iniciais:**
```bash
npm run db:push     # cria as tabelas a partir do schema (src/db/schema.ts)
npm run db:seed     # insere as viaturas de exemplo + o 1º admin
```

---

## 2. Cloudflare R2 — fotos

**Tier grátis:** **10 GB** de armazenamento, 1M operações de escrita e 10M de
leitura por mês, e **tráfego de saída grátis**. Referência: um stand com ~30
carros × 15 fotos otimizadas (~300 KB) ≈ 135 MB → cabem centenas de stands.

**Configurar:**
1. Cloudflare → **R2** → *Create bucket* (ex.: `imperio-fotos`) → `R2_BUCKET`.
2. **R2** → *Manage R2 API Tokens* → criar token com permissão de leitura/escrita
   → obter **Access Key ID** (`R2_ACCESS_KEY_ID`) e **Secret** (`R2_SECRET_ACCESS_KEY`).
3. **Account ID** (canto do dashboard R2) → `R2_ACCOUNT_ID`.
4. Tornar as fotos públicas — uma das opções:
   - **Domínio próprio:** bucket → *Settings* → *Custom Domain* (ex.: `cdn.exemplo.pt`).
   - **Rápido:** bucket → *Settings* → ativar *r2.dev subdomain* (ex.: `https://pub-xxxx.r2.dev`).
   O URL público escolhido vai para `R2_PUBLIC_URL`.

O `next.config.ts` já autoriza o `<Image>` a carregar de `*.r2.dev`,
`*.r2.cloudflarestorage.com` e do host de `R2_PUBLIC_URL`.

---

## 3. Login (Auth.js)

- Autenticação por **email + palavra-passe**; a sessão vive num cookie assinado
  por `AUTH_SECRET` (gerar com `npx auth secret`).
- As contas admin estão na tabela `admin_users` (palavra-passe com hash bcrypt).
- O **primeiro admin** é criado pelo `npm run db:seed`, usando `SEED_ADMIN_EMAIL`
  e `SEED_ADMIN_PASSWORD` do `.env.local`.
- Para **adicionar mais admins**, definir novos valores de `SEED_ADMIN_*` e correr
  `npm run db:seed` de novo (não sobrescreve admins já existentes), ou inserir
  diretamente na base (hash bcrypt).
- Rotas: o site vive no grupo `(site)`; o painel em `/admin`. O login está em
  `/admin/login` e o painel protegido no grupo `admin/(painel)` — o layout desse
  grupo bloqueia o acesso a quem não tem sessão, e **cada server action revalida
  a sessão** (defesa em profundidade).

---

## 4. Vercel — alojamento

- **Plano Pro:** ~**$20/mês por membro**. Projetos **ilimitados** e uso comercial
  permitido → uma conta Pro aloja **muitos** sites de clientes.
- Incluído/mês: 1 TB de tráfego, 10M edge requests, etc. Sites de stand têm pouco
  tráfego, pelo que o custo Vercel é praticamente fixo.

**Deploy:**
1. Importar o repositório na Vercel (framework detetado: Next.js).
2. *Settings → Environment Variables*: colar **todas** as variáveis do `.env.example`
   (menos as `SEED_ADMIN_*`, que só servem para o seed local).
3. Deploy. Ligar o **domínio** em *Settings → Domains*.
4. Correr o seed uma vez contra a base de produção (localmente, com o
   `DATABASE_URL` de produção no `.env.local`): `npm run db:push && npm run db:seed`.

---

## 5. Custos por cenário (o que *tu* pagas)

| Cenário | Neon | R2 | Vercel | **Total/mês** |
|---|---|---|---|---|
| 1 cliente com CRUD | grátis | grátis | $20 | **~$20** |
| 5 clientes (bases isoladas) | grátis¹ | grátis | $20 | **~$20** |
| Cliente "só montra" (sem CRUD) | — | — | partilha o $20 | **~$0 marginal** |

¹ O tier grátis do Neon permite até 100 projetos. Só há custo se um projeto
ultrapassar 0,5 GB de base ou as horas de computação (improvável para um stand);
aí passa ao plano pago do Neon (por uso).

**Comparação:** a alternativa gerida (Supabase) custaria **$25/mês** de base +
~**$10/mês por cliente isolado**. Esta stack troca essa conveniência por custo ~$0,
ao montar as peças e trazer o login na própria app.

O que cobras ao cliente (mensalidade de gestão) é a tua margem, independente
destes custos.

---

## 6. Passo-a-passo para um cliente novo (reutilizar o molde)

1. **Clonar** o repositório para um novo projeto.
2. **Branding:** trocar `src/data/stand.ts` (contactos, nome), logótipo e, se
   necessário, a paleta em `src/app/globals.css`.
3. **Neon:** criar um novo projeto → `DATABASE_URL`.
4. **R2:** criar um novo bucket + acesso público → variáveis `R2_*`.
5. **Auth:** gerar novo `AUTH_SECRET`; definir `SEED_ADMIN_*` do cliente.
6. **Base:** `npm run db:push && npm run db:seed` (o seed traz viaturas de exemplo;
   substituir/apagar pelo `/admin`).
7. **Vercel:** importar, colar as env vars, ligar o domínio do cliente.
8. Entregar ao cliente o URL `/admin` e as credenciais.

Cada cliente fica **isolado** (base e bucket próprios), sem partilha de dados.
