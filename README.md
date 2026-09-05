# Império Auto Concept

Site do stand de automóveis [imperioautoconcept.com](https://www.imperioautoconcept.com) — catálogo de viaturas, fichas detalhadas, contactos, e os pedidos de avaliação e de viatura por encomenda. Conteúdo em português europeu.

## Arrancar

```bash
npm install
npm run dev          # http://localhost:3000
```

Não é preciso configurar nada: as viaturas vivem em `src/data/viaturas.ts` e o site corre sem base de dados nem variáveis de ambiente. Sem `RESEND_API_KEY`, os pedidos enviados por `/compramos` e `/importamos` saem no terminal em vez de irem por email — dá para percorrer o formulário todo sem configurar serviço nenhum.

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

O painel de gestão está em [`docs/admin/`](docs/admin/), incluindo as [tarefas de configuração e os custos](docs/admin/07-tarefas-e-custos.md).

## Alojamento

Vercel, no plano **Pro** — o Hobby proíbe uso comercial, e um site que anuncia a venda de viaturas é uso comercial. Ver [`docs/admin/07`](docs/admin/07-tarefas-e-custos.md).

---

Feito por [DevPlus](https://devplus.pt).
