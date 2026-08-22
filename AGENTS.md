<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# StandDemo

Site de demonstração de um **stand de automóveis**, para apresentar a um cliente. Qualidade visual de nível profissional, âmbito deliberadamente pequeno. Sem backend — dados mock em TypeScript. Conteúdo em **PT-PT**.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · motion v12 · npm

Não há `tailwind.config.*` — o tema vive em `src/app/globals.css`.

## Antes de mexer em código, ler

O sistema de design está documentado em **[`docs/brand/`](docs/brand/)** — dez documentos prescritivos, extraídos do código, com valores literais e regras do que não fazer. Começar pelo [índice e as dez regras não-negociáveis](docs/brand/README.md).

Consoante o que se vai tocar:

| Vais mexer em | Ler |
|---|---|
| Cor, superfícies, badges, overlays | [02 — Cor e matéria](docs/brand/02-cor-e-materia.md) |
| Headings, texto, rótulos | [03 — Tipografia](docs/brand/03-tipografia.md) |
| Secções, grelhas, espaçamento | [04 — Layout e espaço](docs/brand/04-layout-e-espaco.md) |
| Componentes e controlos | [05 — Componentes](docs/brand/05-componentes.md) |
| Animações e gestos | [06 — Movimento](docs/brand/06-movimento.md) |
| Texto visível, números, datas | [07 — Voz e conteúdo](docs/brand/07-voz-e-conteudo.md) |
| Dados, filtros, viaturas | [08 — Dados e domínio](docs/brand/08-dados-e-dominio.md) |
| Rotas, estado, convenções | [09 — Código e arquitetura](docs/brand/09-codigo-e-arquitetura.md) |
| Metadata, indexação, dados estruturados | [SEO — estado e convenções](docs/seo.md) |

Âmbito da demo e o que fica de fora: [01 — Produto e âmbito](docs/brand/01-produto-e-ambito.md).

Quando o código e a documentação divergirem, o código ganha — e o documento corrige-se no mesmo commit.

## Skills

Versionadas em `.agents/skills/` (symlinks em `.claude/skills/`, geridas via `npx skills` / `skills-lock.json`). Usar por defeito no trabalho de UI:

- **impeccable** — skill orquestradora principal para criar/rever/polir interfaces (sub-comandos: craft, audit, polish, animate, critique...).
- **emil-design-eng** + **animation-vocabulary** / **improve-animations** / **review-animations** — design engineering e qualidade de animações.
- **design-taste-frontend** / **high-end-visual-design** — critérios de bom gosto visual, evitar aspeto genérico de IA.
- **find-skills** — para descobrir e instalar novas skills quando necessário.

Existe também o plugin **frontend-design** (Anthropic) instalado a nível de utilizador.
