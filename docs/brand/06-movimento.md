# 06 — Movimento

> **Aplica-se a** — toda a animação, transição e gesto.
> **Fonte de verdade** — `src/components/ui/Reveal.tsx` (o easing canónico), `src/app/globals.css:159–218`.
> **Ler antes de** — animar seja o que for.

## A regra da ferramenta

**CSS por defeito; `motion/react` só onde o CSS não chega.**

O projeto tem `motion` v12 instalado, mas usa-o em apenas **5 ficheiros**: `Reveal`, `Contador`, `LogoAnel`, `Preloader` e `Lightbox`. Todo o resto — 45 usos de `transition-colors` — é CSS.

Recorrer a `motion` só quando há: entrada baseada em viewport, orquestração de sequência, gesto de arrasto, ou valor a interpolar fora do DOM. Um hover não é nenhum destes.

## Easing canónico

```
[0.22, 1, 0.36, 1]
```

Um *ease-out* expo. É o easing de todas as entradas do projeto — `Reveal.tsx:22` e `Lightbox.tsx:71`. Não introduzir outras curvas para entrada de conteúdo.

Os únicos outros easings em uso: `"linear"` (rotação infinita do anel), `"easeInOut"` (pulsação do logótipo), `"easeOut"` (contador, zoom do preloader, Ken Burns).

## Entrada em scroll

O padrão único, encapsulado em `<Reveal>`:

```tsx
initial={reduzido ? false : { opacity: 0, y: 24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
```

- **`y: 24`** — deslocamento curto. Distâncias maiores dão aspeto de template.
- **`once: true`** — obrigatório. Reanimar ao voltar a passar é irritante e faz o site parecer instável.
- **`margin: "-80px"`** — dispara 80px antes de entrar em viewport, para o movimento acabar quando o olho chega.

**Stagger de listas: `delay={i * 0.08}`** — em `GrelhaMarcas` e `Sugestoes`. O hero usa um stagger editorial escrito à mão: `0 → 0.1 → 0.2 → 0.3`.

## Durações

| Duração | Uso |
|---|---|
| `duration-200` (6) | Mudança de cor, opacidade de setas, rotação do `›` |
| `duration-300` (6) | Hover de card, aparecimento do CTA flutuante |
| `duration-500` (4) | Zoom de foto no hover, trilho e coverflow do carrossel |
| `0.25s` | Fade do lightbox |
| `0.3s` | Slide de foto no lightbox (`x: 24 → 0`) |
| `0.4s` | Contador |
| `0.7s` | Entrada em scroll |
| `22s` | Ken Burns |

Regra: **quanto maior a coisa que se move, mais lenta.** Cor muda em 200ms; uma foto inteira leva 500ms.

## Gestos

Três implementações, com limiares que interessam.

**`CarCard`** — swipe manual com Pointer Events:
```
LIMIAR_MOVE  = 6   // px acima dos quais é arrasto, não clique
LIMIAR_SWIPE = 40  // px para trocar de foto
```
Usa `setPointerCapture`, `touch-pan-y` (deixa passar o scroll vertical), `cursor-grab` / `active:cursor-grabbing`, e um `onClickCapture` no `<Link>` que **cancela a navegação** se `moveu.current` — sem isso, arrastar a foto abre a página.

Este par de limiares é o padrão a seguir em qualquer superfície arrastável nova.

**`Lightbox`** — arrasto com `motion`:
```
drag="x"  dragConstraints={{ left: 0, right: 0 }}  dragElastic={0.15}
```
Threshold de ±80px para trocar de foto. Mais teclado: `Escape`, `ArrowLeft`, `ArrowRight`.

**`DestaquesCarrossel`** — loop infinito por triplicação (`COPIAS = 3`), `GAP = 24`, `LIMIAR_ARRASTO = 6`, largura de card `Math.min(460, container * 0.8)`, medido com `ResizeObserver`. Efeito coverflow: card central `z-10 scale-100 opacity-100`, laterais `scale-[0.82] opacity-35 blur-[2px]`, com `transition-[transform,opacity,filter] duration-500 ease-out`.

## Ken Burns

O único `@keyframes` custom do projeto:

```css
@keyframes kenburns { from { transform: scale(1) } to { transform: scale(1.07) } }
.kenburns { animation: kenburns 22s ease-out forwards; }
```

22 segundos, 7% de zoom, `forwards` (não faz loop). É lento de propósito — deve ser percebido como profundidade, não como animação.

## Ecrãs de carregamento cortam a seco

`Preloader` e `TransicaoRota` aparecem e desaparecem **sem fade**. O racional está comentado em ambos, e é uma decisão de qualidade, não uma simplificação:

> *Sem fade: aparece e sai de uma vez. Com fade-in via-se, por instantes, um frame da página de destino por baixo do overlay ainda translúcido.*

Ambos são comandados por temporizador (`MINIMO_MS` / `LIMITE_MS`), nunca pelo fim da animação — o `LIMITE_MS = 3000` é a rede de segurança que garante que o ecrã nunca fica preso.

## Reduced motion

Duas camadas, ambas obrigatórias.

**1. Kill-switch CSS global** (`globals.css:207`):
```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**2. `useReducedMotion()` em cada componente `motion`.** O kill-switch CSS não alcança animações em JS — o Framer escreve estilos inline. Por isso `Reveal`, `Contador`, `LogoAnel` e `Preloader` verificam explicitamente.

O padrão: `initial={reduzido ? false : {…}}` (Reveal), `animate={reduzido ? undefined : {…}}` (LogoAnel).

**Exceção atual:** o `Lightbox` não usa `useReducedMotion()`. O fade de 0.25s e o slide de 24px passam com preferência reduzida. É a única lacuna conhecida.

**Qualquer componente `motion` novo tem de verificar `useReducedMotion()`.**

## Nunca

- **`whileHover` / `whileTap`.** Não existem no projeto — hover é CSS.
- **`active:scale-*`.** 0 usos. Os botões respondem por cor, não por escala.
- **Animar `top`, `left`, `width` ou `height`.** Só `transform` e `opacity` (e `filter` no coverflow).
- **Entrada em scroll sem `once: true`.**
- **Um componente `motion` novo sem `useReducedMotion()`.**
- **Introduzir uma curva de easing nova** para entrada de conteúdo — usar `[0.22, 1, 0.36, 1]`.
- **Fazer fade nos ecrãs de carregamento.** Corte seco, por razão documentada.
- **Usar `motion` para um hover** ou uma mudança de cor.
