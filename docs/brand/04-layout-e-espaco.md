# 04 — Layout e espaço

> **Aplica-se a** — estrutura de página, grelhas, espaçamento, breakpoints, camadas.
> **Fonte de verdade** — `src/components/layout/`, os `<section>` em `src/components/home/` e `src/app/`.
> **Ler antes de** — criar uma secção nova, uma página nova ou um overlay.

## Container

Um só, em todo o site — 9 usos:

```
mx-auto max-w-6xl px-4 sm:px-6
```

Não há classe `.container` custom e não há outras larguras de página. Uma secção que precise de fundo a toda a largura põe o fundo no `<section>` e o container no `<div>` interior:

```tsx
<section className="border-y border-line/60 bg-surface">
  <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">…</div>
</section>
```

É o padrão da grelha de marcas e das sugestões — as duas secções em `bg-surface` que quebram o ritmo do fundo base.

## Ritmo vertical

O espaçamento entre secções não é uniforme; varia com o peso da secção:

| Padding | Secção |
|---|---|
| `py-20 sm:py-28` | Secção principal da homepage (Destaques, Sobre/Contactos) |
| `py-20` | Grelha de marcas |
| `py-16` | Sugestões (secundária, no fim do detalhe) |
| `py-14` | Footer |

O hero não usa padding vertical — usa `min-h-[92svh]` com `flex items-center`. As páginas de estado (404, loading) usam `min-h-[70svh]`.

Unidade: **`svh`, não `vh`** — evita o salto na barra de endereço em mobile.

## Offsets do header fixo

O header é `fixed`, logo o conteúdo precisa de compensar:

| Contexto | Classe |
|---|---|
| Topo de `/viaturas` | `pt-28` |
| Topo do detalhe | `pt-24` |
| Alvo de âncora (`#contactos`) | `scroll-mt-24` |
| Elemento sticky (cartão-resumo) | `lg:sticky lg:top-24` |

Ao acrescentar uma âncora nova, não esquecer o `scroll-mt-24` — sem ele o header tapa o título.

## Grelhas

| Grelha | Contexto |
|---|---|
| `sm:grid-cols-2` | Cards de viatura, ficha técnica (6 usos — a mais comum) |
| `sm:grid-cols-2 lg:grid-cols-3` | Grelhas de cards mais densas |
| `md:grid-cols-3` | Colunas do footer |
| `grid-cols-4 sm:grid-cols-6` | Miniaturas da galeria |
| `lg:grid-cols-[280px_1fr]` | Catálogo: sidebar de filtros + resultados |
| `lg:grid-cols-[1fr_360px]` | Detalhe: conteúdo + cartão sticky |

As duas assimétricas usam larguras fixas em px na coluna lateral — a sidebar de filtros e o cartão-resumo têm largura ótima e não devem esticar.

Gaps: `gap-4` (dentro de componentes), `gap-6` (grelha de cards), `gap-10` (colunas de página), `gap-12` (o mais largo, uma vez).

## Breakpoints

Três, com papéis distintos:

| Breakpoint | Papel | Usos |
|---|---|---|
| `sm:` | O breakpoint de trabalho — padding, tamanhos, grelha de 1→2 colunas | 28 |
| `lg:` | Fronteira estrutural: sidebar vs drawer, sticky ativo, controlos que só aparecem no hover | 13 |
| `md:` | Só a navegação — menu desktop vs hamburger, colunas do footer | 7 |

**`xl:` e `2xl:` não existem no projeto** — 0 usos. O container para nos 6xl, portanto não há nada a ganhar acima disso.

## Camadas (z-index)

Escala fechada. Ao acrescentar algo sobreposto, usar um destes valores:

| Valor | O quê |
|---|---|
| `z-10` | Conteúdo sobre foto: badges, setas do card, indicadores (10 usos) |
| `z-20` | Setas do carrossel de destaques |
| `z-40` | CTA flutuante "Fale agora" |
| `z-50` | Header fixo, drawer de filtros |
| `z-[60]` | Lightbox — acima do header, de propósito |
| `z-[100]` | Preloader e transição de rota — acima de tudo |

## Proporções

| Ratio | Onde |
|---|---|
| `aspect-[4/3]` | Foto do card, miniaturas da galeria |
| `aspect-[16/10]` | Galeria principal, carrossel de destaques |

Todas as fotos de viatura usam `next/image` com `fill` — o contentor define a proporção, a imagem preenche com `object-cover`.

## Header

```
fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-background/70 backdrop-blur-xl
```

Altura `h-16`. Logótipo à esquerda (`h-10 w-auto`), nav ao centro-direita, CTA "Fale connosco" em botão de contorno.

- Desktop: `hidden items-center gap-8 md:flex`
- Mobile: hamburger de **duas `<span className="h-px w-6 bg-ink">`** que rodam ±45° com `translate-y-[3.5px]`; o menu aberto usa `font-display text-2xl`
- Link ativo `text-gold`, inativo `text-muted hover:text-ink`
- Fecha-se sozinho na mudança de `pathname`

## Footer

```
border-t border-line/60 bg-surface
```

`grid gap-10 md:grid-cols-3` — logótipo + slogan, Navegação, Contactos. Cabeçalhos de coluna em `text-xs uppercase tracking-[0.2em] text-gold`. Fecha com `.hairline mt-12` e o copyright centrado em `text-xs text-muted`.

Todos os dados de contacto vêm de `src/data/stand.ts`. Ver [07 — Voz e conteúdo](07-voz-e-conteudo.md).

## Nunca

- **Inventar breakpoints.** `sm:` para tudo, `lg:` para estrutura, `md:` para nav. Sem `xl:` nem `2xl:`.
- **Usar largura diferente de `max-w-6xl`** para conteúdo de página.
- **Usar `vh`** em alturas de ecrã inteiro — usar `svh`.
- **Escolher um z-index fora da escala.** Se nenhum serve, o problema é a arquitetura de camadas.
- **Criar uma âncora sem `scroll-mt-24`.**
- **Esticar as colunas laterais** do catálogo ou do detalhe — as larguras fixas são intencionais.
