# 05 — Componentes

> **Aplica-se a** — todos os componentes de interface e os padrões repetidos entre eles.
> **Fonte de verdade** — `src/components/` (`ui/`, `car/`, `catalogo/`, `home/`, `layout/`).
> **Ler antes de** — criar um componente novo ou estilizar um controlo.

## Componentes base — `src/components/ui/`

### `Botao` / `BotaoLink`

O único componente com sistema de variantes. Exporta dois com a mesma aparência: `BotaoLink` (envolve `next/link`) e `Botao` (`<button>`).

```ts
type Variante = "dourado" | "contorno" | "fantasma";
```

Base partilhada:
```
press inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide
cursor-pointer select-none
```

| Variante | Classes | Uso |
|---|---|---|
| `dourado` (default) | `gold-metal-fill text-background font-medium` | Ação primária |
| `contorno` | `border border-gold/40 text-champagne hover:border-gold hover:text-gold-bright` | Ação secundária |
| `fantasma` | `text-muted hover:text-gold-bright` | Ação terciária |

A `.press` trata da transição toda — cor, brilho e escala ao premir. Por isso a base **não** leva `transition-colors`: seriam duas declarações a colidir. Ver [06 — Movimento](06-movimento.md).

Assinatura: `ComponentProps<typeof Link> & { variante?: Variante; children: ReactNode }`. O `className` é concatenado por template string.

**Não há tamanhos** — um só (`px-6 py-3 text-sm`). Quando é preciso outro padding, passa-se por `className`.

### `Reveal`

Envolve conteúdo numa entrada em scroll. `{ children, delay?: number = 0, className? }`. Detalhes dos valores em [06 — Movimento](06-movimento.md).

### `Contador`

`{ valor: number }`. Número que anima ao mudar — usado nas contagens de resultados. Escreve direto em `textContent`, sem re-render do React.

### `LogoAnel`

Logótipo com anel dourado a girar; base dos ecrãs de carregamento.

```ts
{ tamanho?: "grande" | "pequeno" = "grande"; prioridade?: boolean = false }
const TAMANHOS = { grande: { caixa: 280, logo: 196 }, pequeno: { caixa: 132, logo: 92 } }
```

SVG `viewBox="0 0 100 100"`, dois círculos `r=46` com `strokeWidth=1.25`: um completo em `var(--line)`, outro em `var(--gold)` com `strokeDasharray="72 217"` — o arco dourado é ~25% da circunferência (2πr ≈ 289).

### `Preloader`

Ecrã de abertura. `MINIMO_MS = 1100`, `LIMITE_MS = 3000`, `LARGURA_PX = 200`, `ZOOM = 1.5`.

Fixa em `z-[100]` sobre `bg-background` opaco, trava o scroll do body, e **sai por corte seco**. O comentário no ficheiro explica: *"o preto nunca se desvanece, para a homepage não chegar a aparecer por baixo do logo"*. A saída é comandada por temporizador, não pelo fim da animação.

### `TransicaoRota`

Ecrã breve entre páginas. `MINIMO_MS = 600`, `LIMITE_MS = 3000`. Escuta o evento `"rota:inicio"` disparado por `src/instrumentation-client.ts` — ver [09](09-codigo-e-arquitetura.md). Ignora navegações para a mesma página (âncoras). Também sem fade, pela mesma razão.

## Padrões transversais

### Card canónico

```
rounded-2xl border border-line/60 bg-surface
```
Interativo, acrescenta: `transition-colors duration-300 hover:border-gold/50`.

10 usos de `rounded-2xl`: CarCard, StickyCard, sidebar e modal de filtros, empty state, mapa, cards de marca (estes com `bg-background`), galeria.

### Badges de estado — `car/BadgeEstado.tsx`

Contentor `pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5`, empilhado.

Base comum: `rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em]`.

| Estado | Tratamento | Semântica |
|---|---|---|
| **Vendido** | `.red-metal-fill` + `text-ink` + `font-medium` + sombra | Vermelho metálico — o estado que trava a compra |
| **Reservado** | `.gold-metal-fill` + `text-background` + `font-medium` + sombra | Ouro sólido — atenção, ainda há hipótese |
| **IVA Dedutível** | `border border-gold/50 bg-background/70 text-champagne backdrop-blur` | Contorno — informativo, não é estado |

A sombra dos dois primeiros é `shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]` — assentam sobre a foto e precisam de a descolar.

Nenhuma viatura está `reservado` nem tem IVA dedutível hoje; o MINI está `vendido`. Ver [01](01-produto-e-ambito.md).

### Estado "vendido" — dessaturar, não esconder

Foto a `opacity-60 saturate-50` (`opacity-70 saturate-50` no carrossel), e o preço substituído pela palavra "Vendido" em três sítios: `CarCard`, `StickyCard`, `DestaquesCarrossel`. A viatura continua navegável.

### Select estilizado

O `<select>` nativo é estilizado à mão em três sítios (`HeroSearch`, `SelectField`, `SortSelect`). A receita:

```tsx
<span className="relative block">
  <select className="w-full appearance-none rounded-xl border border-line bg-surface/80
                     px-4 py-3 pr-10 text-sm text-ink outline-none transition-colors
                     focus:border-gold [&>option]:bg-surface">
    …
  </select>
  <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold">▾</span>
</span>
```

Três detalhes que não se podem perder: `appearance-none` mata a seta nativa; `[&>option]:bg-surface` corrige o dropdown branco no Windows/Firefox; o `▾` é `pointer-events-none` para não bloquear o clique.

`SelectField` usa `rounded-xl` (campo de formulário); `SortSelect` usa `rounded-full` (controlo inline).

### Glifos em vez de ícones

O projeto usa caracteres de texto para quase toda a iconografia:

| Glifo | Uso |
|---|---|
| `‹` `›` | Navegação de fotos (card, carrossel, lightbox); `›` também abre o `<details>` da ficha, com `group-open:rotate-90` |
| `→` | Cards de marca, link «Ver todas» dos destaques |
| `↗` | Links externos (Instagram, mapa) |
| `✕` | Fechar overlays, remover chip de filtro |
| `▾` | Seta dos selects |
| `◆` | Bullet dos extras, em `text-gold-deep` |
| `·` | Separador de metadados, em `text-gold-deep` |
| `⤢` | Expandir galeria |
| `✓` | Confirmação ("Ligação copiada ✓") |

Só existem **4 SVGs inline** em todo o projeto: `IconeFiltros` (`CatalogoClient.tsx`, 16×16) e três ícones de meta no carrossel (`DestaquesCarrossel.tsx`, 15×15). Todos com `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth` 1.6–1.7, `strokeLinecap="round"`, `aria-hidden`.

Antes de acrescentar um ícone: verificar se há glifo que sirva.

### Controlos que só aparecem no hover

Setas do card de viatura:
```
lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100
```

Escondidos só em `lg:` (em touch estão sempre visíveis) e **sempre com escape por `focus-visible`** — sem ele ficam inalcançáveis por teclado.

### Imagens

Todas as fotos de viatura: `next/image` com `fill`, `sizes` explícito e `object-cover`. Exemplo do card:

```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
priority={prioridade && foto === inicial}
```

`priority` é seletivo — só as primeiras da grelha (`i < 2`) e as cópias visíveis do carrossel. Zoom no hover: `group-hover:scale-[1.03]` no card, `scale-[1.02]` na galeria, sempre com `duration-500`.

Exceção documentada: os logótipos de marca usam `<img>` com `eslint-disable-next-line` e justificação inline em `GrelhaMarcas.tsx`.

Detalhe de UX no `CarCard`: a miniatura abre na **segunda** foto (`índice 1`) — a página de detalhe é que mostra a primeira. Evita ver duas vezes a mesma imagem ao entrar.

### Acessibilidade

O checklist que o projeto cumpre, e que código novo deve cumprir:

- `aria-label` em todos os botões-ícone (26 usos)
- `aria-live="polite"` nas contagens de resultados e nos ecrãs de carregamento
- `role="dialog"` + `aria-modal` no lightbox e no drawer de filtros
- `aria-labelledby` nas secções com heading (`<section aria-labelledby="ficha-tecnica">`)
- `<fieldset>` / `<legend>` nos sliders de intervalo
- `sr-only` a descrever ecrãs de carregamento ("A carregar")
- `aria-hidden` + `tabIndex={-1}` no CTA flutuante quando escondido
- `aria-hidden` em todos os glifos decorativos
- Lightbox: `Escape`, `ArrowLeft`, `ArrowRight`; bloqueia scroll do body

## Dívida conhecida

Divergências reais entre o padrão e o código. Documentadas, não corrigidas — corrigir só com pedido explícito.

1. **O botão "contorno" está replicado à mão em 6 sítios** fora do `Botao.tsx`: `Header.tsx:55`, `SobreContactos.tsx:81` e `:89`, `StickyCard.tsx:61`, `CatalogoClient.tsx:158` e `:278`. A string de classes é a mesma, mas os paddings divergem (`px-5 py-2`, `px-5 py-2.5`, `px-6 py-3`, `px-6 py-3.5`). É a maior divergência entre o componente e o uso real.
2. **`HeroSearch` duplica o `SelectField`** — tem um componente `Campo` local com a mesma receita, em vez de importar.
3. **O badge "Reservado" tem dois tratamentos.** `BadgeEstado` usa `.gold-metal-fill`; o `StickyCard` usa `bg-gold` chapado.
4. **O carrossel tem um `Badge` próprio** (`DestaquesCarrossel.tsx:54`) que reimplementa o `BadgeEstado` com pequenas divergências: `font-bold` e `tracking-[0.14em]` (contra `font-medium` e `tracking-[0.15em]`), `border-gold/60` (contra `/50`), sem sombra, e mostra **apenas um** badge por prioridade em vez de empilhar. A semântica de cor é a mesma.

## Nunca

- **Criar um card sem a receita canónica** (`rounded-2xl border border-line/60 bg-surface`).
- **Acrescentar um ícone SVG** sem verificar primeiro se há glifo que sirva.
- **Esconder um controlo no hover sem `focus-visible:opacity-100`.**
- **Usar `next/image` sem `sizes`** em fotos de viatura, ou pôr `priority` em tudo.
- **Estilizar um `<select>`** sem `[&>option]:bg-surface` e sem `pointer-events-none` na seta.
- **Introduzir uma quarta variante de botão.** Três chegam.
- **Deixar um botão-ícone sem `aria-label`** ou um glifo decorativo sem `aria-hidden`.
