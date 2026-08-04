# 03 — Tipografia

> **Aplica-se a** — todo o texto: headings, corpo, rótulos, metadados, preços.
> **Fonte de verdade** — `src/app/layout.tsx` (carregamento), `src/app/globals.css:67–82` (escala fluida).
> **Ler antes de** — escrever qualquer heading ou bloco de texto novo.

## As três fontes

Carregadas por `next/font/google` em `src/app/layout.tsx`, todas com `subsets: ["latin"]` e sem `weight` explícito — são variable fonts, todos os pesos estão disponíveis.

| Fonte | Variável | Utility | Onde |
|---|---|---|---|
| **Bodoni Moda** | `--font-bodoni` | `font-display` | Todos os headings e todos os preços. 22 usos |
| **Geist** | `--font-geist-sans` | `font-sans` | Corpo. É o default do `<body>` |
| **Geist Mono** | `--font-geist-mono` | `font-mono` | **Só matrícula e VIN**, em `SpecsTable.tsx` |

A Bodoni é carregada com `style: ["normal", "italic"]` — o itálico não é sintético, é um corte real, e é a peça central da identidade tipográfica.

O contraste didone/grotesk (Bodoni + Geist) é o que dá o registo editorial premium. Não o diluir com uma terceira família.

## Escala fluida

Três classes em `globals.css`, todas `clamp()` — os headings escalam com a viewport sem breakpoints.

| Classe | `font-size` | `line-height` | `letter-spacing` |
|---|---|---|---|
| `.h-hero` | `clamp(3.25rem, 8.5vw, 6.5rem)` | `1` | `-0.015em` |
| `.h-section` | `clamp(2.25rem, 4.8vw, 3.75rem)` | `1.04` | `-0.012em` |
| `.h-sub` | `clamp(1.75rem, 3vw, 2.5rem)` | `1.08` | `-0.01em` |

Tracking negativo, decrescente com o tamanho — texto grande em didone precisa de apertar. Usar sempre estas classes para headings; nunca `text-5xl` e afins.

Uso: `.h-hero` só no hero; `.h-section` nos `<h1>`/`<h2>` de página e secção; `.h-sub` em subsecções dentro do detalhe (Ficha técnica, Extras).

## A assinatura: última palavra em itálico dourado

**A regra tipográfica mais importante do projeto.** Todo o heading de secção termina com a última palavra (ou o último par de palavras) em Bodoni itálico dourado:

```tsx
<h2 className="font-display h-section text-ink">
  Viaturas em <span className="italic text-gold">destaque</span>
</h2>
```

São 11 secções, sem exceção:

| Heading | Onde |
|---|---|
| Viaturas em *destaque* | `home/Destaques.tsx` |
| Escolha pela *marca* | `home/GrelhaMarcas.tsx` |
| Qualidade e *confiança* | `home/SobreContactos.tsx` |
| Todas as *viaturas* | `app/viaturas/page.tsx` |
| Ficha *técnica* | `car/SpecsTable.tsx` |
| Extras e *equipamento* | `car/ExtrasList.tsx` |
| Também vai gostar *destas* | `car/Sugestoes.tsx` |
| Sem resultados *para já* | `catalogo/CatalogoClient.tsx` |
| Página *não encontrada* | `app/not-found.tsx` |

Duas variações deliberadas:

- **Hero** — usa `italic text-gold-metal` em vez de `text-gold`. É o único sítio com o reflexo metálico, e é o que faz do hero o momento tipográfico mais forte da página.
- **Página de detalhe** — o itálico cai sobre a **versão** da viatura (`<span className="italic text-gold">{v.versao}</span>`), não sobre a última palavra. Faz sentido: separa marca+modelo da versão, mantendo a assinatura.

Ao criar uma secção nova, seguir a regra. Um heading sem itálico dourado destoa imediatamente.

## Os seis papéis tipográficos

Receitas copiáveis. Se o texto novo não encaixa em nenhuma, provavelmente está a inventar-se um papel a mais.

**1. Heading de secção**
```
font-display h-section text-ink        (+ última palavra em italic text-gold)
```

**2. Eyebrow** — o rótulo pequeno acima de um heading
```
text-xs uppercase tracking-[0.3em] text-gold
```

**3. Rótulo de campo** — em formulários e cabeçalhos de coluna
```
text-xs uppercase tracking-[0.2em] text-muted
```
Em cabeçalhos de coluna do footer, o mesmo com `text-gold`.

**4. Corpo**
```
text-sm leading-relaxed text-muted      (+ max-w-xs | max-w-md | max-w-2xl)
```
Parágrafos levam **sempre** `leading-relaxed` e **sempre** uma largura máxima. `text-sm` é o tamanho de corpo dominante do site (38 usos); `text-base` só quando o texto é o protagonista da secção.

**5. Metadados de viatura** — a linha `Mês/Ano · Combustível · Km`
```
text-xs uppercase tracking-[0.15em] text-muted
```
com os separadores em elemento próprio: `<span className="text-gold-deep">·</span>`.

**6. Preço**
```
font-display text-gold
```
`text-2xl` no card, `text-4xl` no cartão sticky do detalhe. O preço é sempre Bodoni e sempre dourado — é o segundo elemento mais importante da página, a seguir à foto.

## Tracking

O `letter-spacing` é o que dá o ar editorial ao texto pequeno. A escala em uso:

| Valor | Onde | Usos |
|---|---|---|
| `tracking-[0.3em]` | Eyebrows | 4 |
| `tracking-[0.2em]` | Rótulos de campo, cabeçalhos de coluna | 9 |
| `tracking-[0.15em]` | Metadados, badges | 7 |
| `tracking-[0.14em]` | Badge do carrossel | 2 |
| `tracking-wide` | Botões e links de nav | 8 |

Regra: **quanto mais pequeno e mais uppercase, mais aberto o tracking.** Nunca uppercase sem tracking.

## Pesos

O projeto usa **três pesos, e mais nenhum**:

| Peso | Usos | Onde |
|---|---|---|
| `font-medium` | 10 | CTAs e badges |
| `font-thin` | 2 | Setas `‹ ›` do carrossel |
| `font-bold` | 1 | Badge do carrossel |

`font-semibold` e `font-light` **não existem no projeto** — 0 usos. A hierarquia faz-se por tamanho, cor e família, não por peso. É o que mantém o registo sóbrio.

## Nunca

- **`font-semibold` ou `font-light`.** Não existem aqui; hierarquia por tamanho, cor e família.
- **Bodoni em corpo de texto.** É fonte de display — headings e preços, nada mais.
- **`text-5xl` e afins em headings.** Usar `.h-hero` / `.h-section` / `.h-sub`.
- **Mais do que a última palavra em itálico** num heading. A exceção é a versão da viatura na página de detalhe.
- **Uppercase sem tracking**, ou tracking em texto de corpo.
- **Parágrafos sem `leading-relaxed` ou sem largura máxima.**
- **Uma quarta família tipográfica.** Três chegam, e o contraste entre elas é intencional.
