# 08 — Dados e domínio

> **Aplica-se a** — o modelo de dados, o inventário e os helpers de derivação e filtro.
> **Fonte de verdade** — `src/lib/types.ts`, `src/data/viaturas.ts`, `src/lib/{derivados,filtros,format,slug,marcas}.ts`.
> **Ler antes de** — acrescentar uma viatura, um campo ou um filtro.

> Quando o painel de gestão entrar, `src/data/viaturas.ts` deixa de ser a fonte dos dados e passa a ter dois papéis: alimentar o seed inicial e servir de recurso quando não há base de dados configurada. O tipo `Viatura` e tudo o resto neste documento mantêm-se. Ver [`docs/admin/01`](../admin/01-arquitetura.md).

## O tipo `Viatura`

Trinta campos. **Todos obrigatórios — nenhum opcional.** É a decisão estrutural mais importante do modelo: garante que nenhuma viatura aparece no site com ficha incompleta, e dispensa verificações defensivas na UI.

```ts
interface Viatura {
  id: string;                    // "v-0001"
  marca: string;                 marcaSlug: string;
  modelo: string;                modeloSlug: string;
  versao: string;
  preco: number;                 // euros, inteiro
  registoMes: number;            registoAno: number;   // 1–12, ano cheio
  quilometros: number;
  lugares: number;               portas: number;
  segmento: Segmento;
  combustivel: Combustivel;
  potenciaCv: number;            cilindradaCc: number;
  transmissao: Transmissao;
  cor: string;                   corInterior: string;
  origem: string;                estado: string;        garantia: string;
  livroRevisoes: boolean;        segundaChave: boolean;
  classePortagem: string;
  matricula: string;             vin: string;           // fictícios
  fotos: string[];
  extras: ExtrasCategoria[];
  destaque: boolean;
  estadoVenda: EstadoVenda;
  ivaDedutivel: boolean;
  descricao: string;
}
```

### Uniões

```ts
type Combustivel = "Gasolina" | "Diesel" | "Híbrido" | "Elétrico";
type Transmissao = "Automática" | "Manual";
type Segmento    = "Coupé" | "SUV" | "Carrinha" | "Berlina" | "Cabrio" | "Citadino";
type EstadoVenda = "disponivel" | "reservado" | "vendido";

interface ExtrasCategoria { categoria: string; itens: string[] }
```

**Atenção à assimetria:** `Combustivel`, `Transmissao` e `Segmento` são valores *de apresentação* — acentuados, capitalizados, e vão diretos para o ecrã. `EstadoVenda` é um valor *de estado* — minúsculas, sem acentos (`disponivel`, não `disponível`), e nunca é mostrado tal e qual. Manter a distinção ao acrescentar valores.

## Inventário atual

Seis viaturas, cinco marcas, em `src/data/viaturas.ts`.

| id | Viatura | Preço | Registo | Km | Segmento | Comb. | Cv | Transm. | Destaque | Estado |
|---|---|---|---|---|---|---|---|---|---|---|
| `v-0001` | Porsche Macan S | 42 000 | 7/2017 | 161 860 | SUV | Diesel | 258 | Auto | ✅ | disponível |
| `v-0002` | Mercedes-Benz CLA 250 Sport Aut. | 23 000 | 3/2018 | 224 165 | Berlina | Gasolina | 218 | Auto | ✅ | disponível |
| `v-0003` | Jaguar XE 20d Aut. Portfolio | 15 900 | 5/2015 | 145 300 | Berlina | Diesel | 180 | Auto | ✅ | disponível |
| `v-0004` | Mercedes-Benz CLA 220 d 4Matic OrangeArt | 18 500 | 6/2015 | 236 703 | Berlina | Diesel | 177 | Auto | ❌ | disponível |
| `v-0005` | BMW 520d Touring Pack M | 12 900 | 1/2011 | 212 760 | Carrinha | Diesel | 184 | Manual | ❌ | disponível |
| `v-0006` | MINI Cooper D 3 Portas | 6 000 | 11/2011 | 246 949 | Citadino | Diesel | 110 | Manual | ❌ | **vendido** |

Constantes em todas: `origem: "Importado"`, `estado: "Usado"`, `classePortagem: "Classe 1"`, `ivaDedutivel: false`. `garantia` é `"12 meses"` (×4) ou `"18 meses"` (×2).

**Lacunas de dados** — valores que os tipos permitem mas que nenhuma viatura tem: combustíveis `Híbrido` e `Elétrico`, segmentos `Coupé` e `Cabrio`, estado `reservado`, `ivaDedutivel: true`. Os filtros derivam das viaturas, portanto estas opções simplesmente não aparecem na UI. Ao testar esses caminhos, alterar temporariamente uma viatura.

### Categorias de extras

`Conforto` (6), `Segurança` (6), `Multimédia` (5), `Performance` (5), mais duas específicas de uma viatura: `Edição OrangeArt` (CLA 220 d) e `Pack M / Exterior` (BMW 520d). Categorias one-off são aceitáveis quando descrevem um pacote real da viatura.

## Fotografias

Helper no topo de `viaturas.ts`:

```ts
const fotos = (pasta: string, quantidade: number) =>
  Array.from({ length: quantidade }, (_, i) => `/cars/${pasta}/${String(i + 1).padStart(2, "0")}.jpg`);
```

Convenção: `public/cars/<pasta>/01.jpg … 15.jpg`. **As seis viaturas têm 15 fotos cada.** As pastas são `porsche-macan`, `mercedes-cla-250`, `jaguar-xe`, `mercedes-cla-220d`, `bmw-520d`, `mini-cooper-d`.

**Créditos:** as fotografias vêm dos anúncios públicos do stand **Imperio Auto Concept** no StandVirtual e pertencem ao stand. São usadas nesta demonstração para representar o inventário real do cliente. Detalhe em [`public/cars/CREDITS.md`](../../public/cars/CREDITS.md) — manter atualizado ao acrescentar viaturas.

## Helpers

### `src/lib/derivados.ts` — as opções nascem dos dados

Nenhuma lista de marcas, modelos ou combustíveis é hard-coded. Tudo se deriva de `viaturas` e se ordena com `localeCompare(…, "pt")`:

| Função | Devolve |
|---|---|
| `getMarcas()` | `{ nome, slug }[]`, deduplicado por `Map` |
| `getModelos(marcaSlug?)` | `{ nome, slug, marcaSlug }[]`, filtrável por marca |
| `getCombustiveis()` / `getTransmissoes()` / `getSegmentos()` | valores únicos, ordenados |
| `getIntervalos()` | `{ preco, ano, km }`, cada um `[min, max]` |
| `getDestaques()` | viaturas com `destaque: true` |

`getIntervalos()` arredonda para fora — passo 1000 no preço, 5000 nos km; o ano fica exato. Dá limites redondos aos sliders sem cortar viaturas.

### `src/lib/filtros.ts`

```ts
interface Filtros {         // 12 campos, todos opcionais
  marca?, modelo?, combustivel?, transmissao?, segmento?,
  precoMin?, precoMax?, anoMin?, anoMax?, kmMin?, kmMax?, ordenar?
}
type Ordenacao = "relevancia" | "preco-asc" | "preco-desc" | "ano-desc" | "ano-asc" | "km-asc";
```

- `parseFiltros(searchParams)` — lê o URL, tolerante a arrays e valores inválidos (`umValor` / `umNumero`); descarta `ordenar` que não esteja em `ORDENACOES`.
- `serializeFiltros(filtros)` — omite `undefined`, `""` **e `"relevancia"`**. O default não suja o URL.
- `filtrarViaturas(lista, filtros)` — conjunção simples; marca e modelo comparam por **slug**.
- `ordenarViaturas(lista, ordenar)` — copia antes de ordenar (`[...lista]`), nunca muta.

**A ordenação `"relevancia"`** é a regra de negócio do catálogo, por esta ordem:

1. Estado: `disponivel` (0) → `reservado` (1) → `vendido` (2)
2. `destaque` primeiro
3. Preço ascendente

Ou seja: o que se pode comprar aparece primeiro, os destaques puxam para cima, e a preços iguais o mais barato ganha.

`ano-desc` e `ano-asc` desempatam pelo mês — `b.registoAno - a.registoAno || b.registoMes - a.registoMes`.

### `src/lib/slug.ts`

```ts
urlViatura(v)              // /carros/{marcaSlug}/{modeloSlug}/{id}
urlViaturasPorMarca(slug)  // /viaturas?marca={slug}
```

**Não há função de slugificação.** Os slugs estão escritos à mão nos dados (`marcaSlug: "mercedes-benz"`, `modeloSlug: "cla-220-d"`). É deliberado: gerar slugs em runtime tornaria os URLs reféns da pontuação do nome.

> **Com o painel de gestão, isto muda.** O cliente escreve a marca num formulário, logo o slug passa a ser gerado — mas **ao gravar**, e guardado na base. A regra de não gerar na leitura mantém-se. Ver [`docs/admin/01`](../admin/01-arquitetura.md).

### `src/lib/marcas.ts`

Mapa `LOGOS` de slug → ficheiro em `/logo/marcas/`. Cinco entradas: `bmw.svg`, `mini.svg`, `porsche.svg`, `jaguar.webp`, `mercedes-benz.webp`. `logoMarca(slug)` devolve o caminho ou `null` — a UI faz fallback ao nome da marca.

Ao acrescentar uma marca, acrescentar o logótipo aqui, ou o fallback trata do assunto.

## Acrescentar uma viatura

1. Criar `public/cars/<pasta>/` com fotos numeradas `01.jpg`…
2. Acrescentar a entrada em `src/data/viaturas.ts` com os **30 campos** preenchidos e `fotos("<pasta>", N)`.
3. `marcaSlug` e `modeloSlug` à mão, em kebab-case sem acentos.
4. Se a marca é nova: logótipo em `public/logo/marcas/` e entrada em `LOGOS`.
5. Atualizar `public/cars/CREDITS.md`.

Filtros, opções de pesquisa, intervalos dos sliders e rotas estáticas atualizam-se sozinhos.

## Nunca

- **Tornar um campo de `Viatura` opcional**, ou acrescentar uma viatura com ficha parcial.
- **Hard-coded de marcas, modelos, combustíveis ou intervalos** — derivar de `derivados.ts`.
- **Gerar slugs em runtime.** São dados.
- **Mutar a lista de viaturas.** `ordenarViaturas` copia; manter o padrão.
- **Comparar marca ou modelo por nome.** Filtra-se por slug.
- **Pôr `"relevancia"` no URL** — `serializeFiltros` omite-o de propósito.
- **Misturar convenções nas uniões** — valores de apresentação acentuados, valores de estado em minúsculas sem acentos.
