# 09 — Código e arquitetura

> **Aplica-se a** — estrutura de ficheiros, nomenclatura, server/client components, gestão de estado.
> **Fonte de verdade** — `src/app/`, `package.json`, `tsconfig.json`, `src/instrumentation-client.ts`.
> **Ler antes de** — criar um componente, uma rota, ou mexer no estado dos filtros.

## Antes de escrever código Next.js

**Esta não é a versão do Next.js que conheces.** O Next.js 16 traz breaking changes — APIs, convenções e estrutura de ficheiros podem diferir do que está no teu treino. **Ler o guia relevante em `node_modules/next/dist/docs/` antes de escrever código.** Prestar atenção a avisos de deprecação.

Sintomas concretos disso, já visíveis neste projeto:

- `params` e `searchParams` são **Promises** e têm de ser `await`ed.
- Os tipos de página são globais e derivados da rota: `PageProps<"/viaturas">`, `PageProps<"/carros/[marca]/[modelo]/[id]">`. Não se importam nem se escrevem à mão.
- `src/instrumentation-client.ts` com `onRouterTransitionStart` é o hook que apanha o início de qualquer navegação.

## Stack

| | |
|---|---|
| `next` | 16.2.10 — App Router |
| `react` | 19.2.4 |
| `motion` | ^12.42.2 — importado como `motion/react` |
| `tailwindcss` | ^4, via `@tailwindcss/postcss` |
| TypeScript | alias `@/*` → `./src/*` |
| Gestor de pacotes | **npm** |

**Não há `tailwind.config.*`, e não deve haver.** O Tailwind v4 é CSS-first: o tema vive no `@theme inline` de `src/app/globals.css`. Ver [02 — Cor e matéria](02-cor-e-materia.md).

**Não há bibliotecas de utilidade de classes** — nem `clsx`, nem `cva`, nem `tailwind-merge`. A composição faz-se por template strings e ternários:

```tsx
className={`${base} ${estilos[variante]} ${className}`}
className={`h-1 w-4 rounded-full ${i === foto ? "bg-gold" : "bg-ink/30"}`}
```

Também não há `zod` nem bibliotecas de componentes (Radix e afins). Tudo é escrito à mão. É uma demo pequena; as dependências pagam-se em peso e em risco.

## Nomenclatura — mista, de propósito

**Ficheiros e nomes de componentes de domínio genérico ficam em inglês:**
`CarCard`, `Gallery`, `Lightbox`, `SpecsTable`, `StickyCard`, `FiltersPanel`, `RangeSlider`, `SelectField`, `SortSelect`, `Header`, `Footer`.

**Todo o vocabulário de negócio, props, variáveis, estado e comentários ficam em PT-PT:**
`Viatura`, `Botao`, `Reveal`, `Contador`, `LogoAnel`, `Preloader`, `TransicaoRota`, `CtaFlutuante`, `Sugestoes`, `Destaques`, `GrelhaMarcas`, `SobreContactos`, `BadgeEstado`, e props como `rotulo`, `valor`, `opcoes`, `aberto`, `visivel`, `filtros`, `resultados`, `onLimpar`, `onFechar`, `onNavegar`, `variante`, `prioridade`, `tamanho`.

Constantes de gesto e tempo em maiúsculas portuguesas: `LIMIAR_MOVE`, `LIMIAR_SWIPE`, `MINIMO_MS`, `LIMITE_MS`, `COPIAS`, `TAMANHOS`.

**Todos os comentários estão em português**, e a maioria justifica uma decisão em vez de descrever o código. Manter esse hábito — são a memória do projeto:

```tsx
// miniatura abre na 2ª foto (índice 1); a página dedicada é que mostra a 1ª
// estado ⇄ URL (replaceState: sem spam de histórico nem round-trips ao servidor)
```

## Props

Tipadas inline, no local:

```tsx
export function CarCard({ viatura, prioridade = false }: { viatura: Viatura; prioridade?: boolean }) {
```

Não se exportam interfaces de props. A única exceção é o `Botao`, que estende os props nativos com `ComponentProps<typeof Link> & { … }`.

## Server-first

18 ficheiros têm `"use client"`. Tudo o resto é server component: `Botao`, `BadgeEstado`, `SpecsTable`, `ExtrasList`, `Sugestoes`, `Footer`, `Hero`, `Destaques`, `GrelhaMarcas`, `SobreContactos` e todas as `page.tsx`.

A regra: `"use client"` só quando há estado, efeito, evento de DOM ou hook de browser. Um componente que só recebe props e renderiza fica no servidor.

## Rotas

```
src/app/
├── layout.tsx                                    fontes, metadata, Header/Footer/CTA/overlays
├── page.tsx                                      homepage
├── globals.css
├── not-found.tsx
├── viaturas/
│   ├── page.tsx                                  PageProps<"/viaturas">
│   └── loading.tsx
└── carros/[marca]/[modelo]/[id]/page.tsx         generateStaticParams + generateMetadata
```

A rota de detalhe é totalmente estática: `generateStaticParams()` mapeia as viaturas para `{ marca, modelo, id }`, e `encontrarViatura()` valida os três segmentos em conjunto — um URL com marca certa e modelo errado dá `notFound()`.

O `layout.tsx` monta `<Header>`, `<main className="flex-1">`, `<Footer>`, `<CtaFlutuante>`, `<TransicaoRota>` e `<Preloader>`, com `<body className="min-h-full flex flex-col">`.

## Estado dos filtros — o padrão mais subtil do projeto

Híbrido servidor/cliente, em três tempos:

**1. O servidor lê o URL.** `viaturas/page.tsx` faz `await searchParams`, passa por `parseFiltros()` e entrega o resultado como `filtrosIniciais`. Um link partilhado com `?marca=bmw` renderiza já filtrado.

**2. O cliente assume.** `CatalogoClient` guarda em `useState<Filtros>(filtrosIniciais)`. A partir daqui, o estado local é a fonte de verdade e a filtragem é `useMemo` sobre o array em memória — instantânea.

**3. O URL espelha o estado.**

```tsx
const primeiraRender = useRef(true);
useEffect(() => {
  if (primeiraRender.current) { primeiraRender.current = false; return; }
  const qs = serializeFiltros(filtros);
  window.history.replaceState(null, "", qs ? `/viaturas?${qs}` : "/viaturas");
}, [filtros]);
```

Três decisões embutidas aqui:

- **`replaceState`, não `push`** — mexer num slider não deve encher o histórico. O comentário no ficheiro: *"sem spam de histórico nem round-trips ao servidor"*.
- **`window.history` direto, não `router.replace`** — o router do Next revalidaria a rota no servidor a cada tecla.
- **A guarda `primeiraRender`** evita reescrever o URL com o que dele acabou de sair.

**Exceção:** o `HeroSearch` da homepage usa `router.push()` com `serializeFiltros()` — é uma navegação real entre páginas, e essa deve ficar no histórico.

Ao mexer em filtros: manter o padrão. `router.push` a cada alteração destrói a fluidez; `pushState` destrói o botão "voltar".

## Transições de rota

`src/instrumentation-client.ts` exporta `onRouterTransitionStart`, hook do Next 16 que dispara em **todas** as navegações do router — cliques em `<Link>` e chamadas a `router.push()`. Emite um `CustomEvent("rota:inicio")` que o `TransicaoRota` escuta.

É o único ponto que apanha ambos os casos; não substituir por listeners em `<Link>`.

## Nunca

- **Escrever código Next.js sem consultar `node_modules/next/dist/docs/`.**
- **Criar `tailwind.config.ts`.** O tema vive no `globals.css`.
- **Instalar `clsx`, `cva`, `tailwind-merge`, `zod` ou uma biblioteca de componentes.**
- **`useEffect` para carregar dados** — os dados são estáticos e importam-se diretamente. (Com o painel de gestão a regra mantém-se: a leitura passa a ser assíncrona em server components, nunca em `useEffect`. Ver [`docs/admin/01`](../admin/01-arquitetura.md).)
- **`router.push()` numa mudança de filtro** — `window.history.replaceState`.
- **Marcar um componente `"use client"`** sem estado, efeito ou evento.
- **Escrever comentários em inglês** ou traduzir os que existem.
- **Importar tipos de página à mão** — `PageProps<"…">` é global.
