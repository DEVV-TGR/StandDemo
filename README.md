# Império Auto Concept

Site do stand de automóveis [imperioautoconcept.com](https://www.imperioautoconcept.com) — catálogo de viaturas, fichas detalhadas e contactos. Conteúdo em português europeu.

## Arrancar

```bash
npm install
npm run dev          # http://localhost:3000
```

Não é preciso configurar nada: as viaturas vivem em `src/data/viaturas.ts` e o site corre sem base de dados nem variáveis de ambiente.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint sobre `src/` |
| `npm run check:seo` | Valida a metadata de todas as rotas |
| `npx tsc --noEmit` | Verificação de tipos |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · motion v12

Não há `tailwind.config.*` — o tema vive em `src/app/globals.css`.

## Antes de mexer em código

O sistema de design está documentado em [`docs/brand/`](docs/brand/), com valores literais e regras do que não fazer. As convenções de trabalho e o índice completo estão em [`AGENTS.md`](AGENTS.md).

O painel de gestão ainda não existe; a especificação está em [`docs/admin/`](docs/admin/), incluindo as [tarefas de configuração e os custos](docs/admin/07-tarefas-e-custos.md).

## Alojamento

Vercel, no plano **Pro** — o Hobby proíbe uso comercial, e um site que anuncia a venda de viaturas é uso comercial. Ver [`docs/admin/07`](docs/admin/07-tarefas-e-custos.md).

---

Feito por [DevPlus](https://devplus.pt).
