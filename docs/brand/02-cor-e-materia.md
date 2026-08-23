# 02 — Cor e matéria

> **Aplica-se a** — toda a cor, superfície, borda, gradiente e estado de foco.
> **Fonte de verdade** — `src/app/globals.css` (linhas 3–66 para tokens, 90–179 para materiais).
> **Ler antes de** — escrever qualquer classe de cor, criar um card, um overlay ou um badge.

## Tokens

Tema escuro fixo. Todas as cores em **OKLCH**, definidas em `:root` e expostas ao Tailwind por `@theme inline`.

### Fundos e linhas

| Token | Valor | Papel | Utility |
|---|---|---|---|
| `--background` | `oklch(0.13 0 0)` | Fundo base. Neutro puro, chroma 0 | `bg-background` |
| `--surface` | `oklch(0.18 0 0)` | Cards, painéis, footer. Neutro puro | `bg-surface` |
| `--raised` | `oklch(0.21 0.012 85)` | Superfície elevada, ligeiramente quente | `bg-raised` |
| `--line` | `oklch(0.27 0.016 85)` | Bordas e divisores | `border-line` |

Repare na progressão de temperatura: os dois fundos mais escuros são **neutros puros** (chroma 0); o calor entra só a partir de `--raised`. É deliberado — mantém os pretos limpos e evita que o site pareça sépia.

### Dourados

| Token | Valor | Papel | Utility |
|---|---|---|---|
| `--gold` | `oklch(0.70 0.093 76)` | Dourado primário: bordas ativas, ícones, indicadores | `text-gold` `bg-gold` |
| `--gold-bright` | `oklch(0.83 0.086 82)` | Hover e realce | `hover:text-gold-bright` |
| `--gold-deep` | `oklch(0.5 0.082 66)` | Separadores, glifos, extremos de gradiente | `text-gold-deep` |
| `--champagne` | `oklch(0.88 0.036 84)` | Texto dourado suave, botões de contorno | `text-champagne` |

O racional está comentado no próprio `globals.css` e é a decisão de cor mais importante do projeto:

> *dourados — metálico quente (âmbar/bronze), não amarelo-limão. hue baixado para ~76 (âmbar) e chroma reduzido: o amarelo-marcador vem de chroma+claridade altos; um ouro real é mais quente e mais "sujo".*

Ou seja: **o ouro deste site é âmbar dessaturado, não amarelo brilhante.** Subir o chroma ou a claridade destrói o efeito e faz o site parecer barato.

### Cores de estado — vermelho e verde

| Token | Valor | Papel | Utility |
|---|---|---|---|
| `--red` | `oklch(0.55 0.19 27)` | Vendido | `bg-red` `text-red` |
| `--red-deep` | `oklch(0.42 0.16 27)` | Extremos do gradiente, bordas | `border-red-deep` |
| `--red-bright` | `oklch(0.68 0.2 27)` | Centro do gradiente, texto sobre fundo escuro | `text-red-bright` |
| `--sucesso` | `oklch(0.62 0.12 152)` | Disponível | `bg-sucesso` `text-sucesso` |
| `--sucesso-deep` | `oklch(0.48 0.1 152)` | Bordas e fundos esbatidos | `border-sucesso-deep` |

**No site, o vermelho continua a ser exclusivamente o badge "Vendido"**, via `.red-metal-fill`, e o verde não aparece de todo — uma viatura disponível não leva badge nenhum. São cores de estado, não cores do sistema: não se usam para decorar.

**No painel `/admin` é diferente**, e é por isso que estão expostas ao Tailwind. A listagem precisa de distinguir três estados numa tabela densa, e aí o disponível tem de se ver. O verde é mais claro e menos saturado que o vermelho de propósito: disponível é o estado de quase todas as viaturas, e se gritasse tanto como o vendido a listagem virava um semáforo — o que é excepção deixaria de se ler. Hue 152, o verde mais neutro; a 145 puxa a amarelo e choca com os dourados.

O verde tem dois stops e o vermelho três: o `--red-bright` existe para alimentar o gradiente do `.red-metal-fill`, e o painel não leva metálicos ([`docs/admin/05`](../admin/05-painel-ux.md)).

> **Nota histórica.** Os vermelhos existiam em `:root` desde o PR #17 mas nunca chegaram ao `@theme inline`, portanto `bg-red` e `text-red` não existiam — só a classe `.red-metal-fill`. Foi essa lacuna que levou o painel do PR #12 a escrever `emerald-500` e `red-400`, cores do Tailwind por omissão, fora do sistema. Nenhuma classe de cor por omissão do Tailwind deve aparecer em `src/app/admin/` nem em `src/components/admin/`.

### Texto

| Token | Valor | Papel | Utility |
|---|---|---|---|
| `--ink` | `oklch(0.96 0.012 95)` | Texto principal, branco quente | `text-ink` |
| `--muted` | `oklch(0.7 0.022 95)` | Texto secundário, rótulos, meta | `text-muted` |

## A hierarquia do dourado

A regra que mantém o site coerente. Cada tom tem uma função e não se troca por outro:

| Tom | Onde entra |
|---|---|
| `gold` | Fundo de CTA primário, borda ativa/focada, link de nav ativo, ponto ativo do carrossel, `▾` dos selects, `:focus-visible` |
| `gold-bright` | **Hover de texto**, e só isso. 23 usos |
| `gold-deep` | Separador `·` entre metadados, bullet `◆` dos extras, extremos dos gradientes metálicos, anel do thumb dos sliders |
| `champagne` | Texto de botão de contorno, notas informativas discretas |

Corolário prático — os dois estados de hover do projeto:

```
texto  →  hover:text-gold-bright      (23 usos)
borda  →  hover:border-gold            (14 usos)
card   →  hover:border-gold/50
```

## Materiais

### Ouro metálico

Três utilities dão a sensação de **folha de ouro** em vez de tinta chapada. É o que separa este site de um tema dourado genérico.

**`.text-gold-metal`** — reflexo aplicado ao próprio texto, por `background-clip: text`. Gradiente a 100°, stops `gold-deep → gold → champagne → gold-bright → gold → gold-deep`.

Regra do próprio ficheiro: **usar só em texto grande.** Tem exatamente **1 uso** em todo o projeto — a palavra "procura?" no heading do hero (`Hero.tsx:31`). Manter assim: a escassez é o que lhe dá peso.

**`.gold-metal-fill`** — preenchimento de superfície, gradiente diagonal a 140°, mais `filter: brightness(1.08)` no hover. É o preenchimento de **todos os CTAs dourados** — o botão do hero, o "Fale agora", o "Ligar" do detalhe, o "Ver resultados" dos filtros e a variante `dourado` do `Botao` — e ainda do badge "Reservado".

Um botão dourado usa gradiente, não cor chapada. O `bg-gold` fica reservado a superfícies pequenas onde um gradiente não se leria: badges, pontos de paginação, contadores e o trilho dos sliders.

**`.red-metal-fill`** — o mesmo reflexo diagonal, em vermelho, só para o badge "Vendido".

### `.hairline` — a assinatura visual

```css
height: 1px;
background: linear-gradient(90deg, transparent, gold-deep 20%, gold 50%, gold-deep 80%, transparent);
```

Uma linha fina dourada que desvanece nas pontas. É o **único divisor decorativo do projeto** — 6 usos: fecho do hero, `my-6` no cartão sticky, `my-8` na secção sobre, `mt-12` no footer, duas vezes no painel de filtros.

### `.grain`

Ruído SVG (`feTurbulence`, `baseFrequency 0.8`) a `opacity: 0.5` sobre fotos grandes. Aplica-se como classe no contentor — usa `::after` com `position: absolute`, portanto o pai tem de ser `relative`. Um único uso, no hero.

## Superfícies

**A borda por defeito é `border-line/60`** — 16 usos. A `/60` não é decoração: à opacidade cheia a linha lê-se como um traço; a 60% lê-se como uma sombra. Usar `border-line` cheio só em controlos de formulário (selects), onde a borda tem de ser tocável.

**Card canónico:**

```
rounded-2xl border border-line/60 bg-surface
```

Com hover, quando o card é interativo:

```
transition-colors duration-300 hover:border-gold/50
```

**Camadas fixas** (header, overlays, setas, pílulas sobre fotos) são translúcidas com blur — 11 usos:

| Contexto | Classe |
|---|---|
| Header | `bg-background/70 backdrop-blur-xl` |
| Caixa de pesquisa do hero | `bg-background/60 backdrop-blur-xl` |
| Setas e badges sobre foto | `bg-background/60` → `hover:bg-background/85` `backdrop-blur` |
| Scrim do drawer de filtros | `bg-background/50 backdrop-blur-sm` |
| Lightbox | `bg-background/95 backdrop-blur-xl` |

**Sombras — só para o que flutua.** Existem em 4 sítios, todos elementos sobrepostos a outro conteúdo: badges sobre fotos (`shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]`), CTA flutuante (`shadow-lg shadow-black/40`), drawer de filtros (`shadow-2xl shadow-black/60`). **Cards estáticos não levam sombra** — a separação vem da borda, não da elevação.

## Gradientes sobre fotos

Sempre a partir de `from-background`, **nunca preto puro** — preto puro sobre `oklch(0.13 0 0)` cria uma banda visível. Sempre `pointer-events-none`.

Os três em uso:

```
Hero, véu lateral:   bg-gradient-to-r from-background via-background/70 to-background/20
Hero, véu inferior:  bg-gradient-to-t from-background via-transparent to-background/60
Carrossel, base:     bg-gradient-to-t from-background/90 to-transparent
```

O hero sobrepõe dois véus em direções diferentes: um assenta o texto à esquerda, o outro funde a foto no fundo da secção.

## Estado "vendido"

O tratamento é **dessaturar, não esconder**: `opacity-60 saturate-50` na foto do card (`opacity-70 saturate-50` no carrossel), e o preço é literalmente substituído pela palavra "Vendido" em três sítios. A viatura continua navegável e visível — só deixa de competir por atenção.

## Foco

Definido globalmente, uma vez:

```css
:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
```

Não sobrepor por componente. Se um controlo precisar de foco diferente, o problema é o controlo.

E a seleção de texto: `::selection` é `background: gold; color: background`.

## Nunca

- **Escrever cores em hex ou `rgb()`.** Todas as cores vivem em tokens; usar as utilities (`bg-gold`, `text-muted`, `border-line`). A única exceção existente é o `rgba()` dentro do valor de sombra dos badges.
- **Usar dourado em áreas grandes.** É cor de ação e realce. Um painel dourado quebra o registo premium imediatamente.
- **Aumentar o chroma dos dourados** para os tornar mais vivos — vira amarelo-marcador e o comentário no `globals.css` explica porquê.
- **Pôr sombra em cards estáticos.** Sombra só em elementos que flutuam sobre outro conteúdo.
- **Usar preto puro** em gradientes ou fundos; usar `from-background`.
- **Introduzir light mode, classes `dark:` ou media queries de tema.** O tema é escuro e fixo.
- **Espalhar `.text-gold-metal`.** Um uso, em texto grande. Escassez é o efeito.
- **Sobrepor `:focus-visible`** por componente.
