# Badges de estado das viaturas

Sinais/placas que aparecem sobre a foto de cada viatura para indicar o seu
estado de venda. Ficam sempre no **canto superior esquerdo** do card.

## Estados e cores

| Estado (`estadoVenda`) | Badge | Aspeto |
|---|---|---|
| `disponivel` | *(sem badge)* | — |
| `reservado` | **Reservado** | Dourado metálico (`gold-metal-fill`) |
| `vendido` | **Vendido** | Vermelho metálico (`red-metal-fill`) |

Existe ainda um badge independente **IVA Dedutível**, controlado pelo campo
`ivaDedutivel` (bool), com contorno dourado. Pode acumular com os de estado.

Quando uma viatura está `vendido`, além do badge a foto fica esbatida
(`opacity`/`saturate` reduzidos) e o preço é substituído pela palavra
"Vendido".

## Onde aparece

- **Catálogo `/viaturas`** e qualquer grelha de cards — componente `CarCard`.
- **Carrossel "Viaturas em Destaque"** na homepage — componente `DestaquesCarrossel`.

## Como marcar uma viatura

Editar `src/data/viaturas.ts` e definir o campo `estadoVenda` da viatura:

```ts
estadoVenda: "vendido",   // "disponivel" | "reservado" | "vendido"
```

Não é preciso mais nada — o badge e o tratamento visual são automáticos.

## Estado atual (demo)

- **MINI Cooper D** → `vendido` (vermelho metálico)
- Todas as restantes viaturas → `disponivel` (sem badge)

## Ficheiros envolvidos

- `src/data/viaturas.ts` — campo `estadoVenda` por viatura.
- `src/lib/types.ts` — tipo `EstadoVenda`.
- `src/components/car/BadgeEstado.tsx` — badge nos cards.
- `src/components/home/DestaquesCarrossel.tsx` — badge no carrossel de destaques.
- `src/app/globals.css` — tokens de cor (`--red*`) e classes metálicas
  (`.gold-metal-fill`, `.red-metal-fill`).
