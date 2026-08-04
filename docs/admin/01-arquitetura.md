# 01 — Arquitetura

> **Aplica-se a** — como os dados fluem, como as rotas se organizam, o que é dinâmico.
> **Fonte de verdade** — hoje `src/data/viaturas.ts` e `src/lib/derivados.ts`; na reintegração, os ficheiros do PR #12 (`bf14fed`).
> **Ler antes de** — mexer na camada de dados ou criar rotas do painel.

## O defeito que causou o revert

É o ponto mais importante deste documento, porque já custou um PR inteiro.

No PR #12, `src/db/index.ts` lançava erro quando faltava `DATABASE_URL`:

```ts
if (!databaseUrl) {
  throw new Error("DATABASE_URL em falta. Defina a connection string do Neon…");
}
```

A ligação era preguiçosa, o que resolvia o `next build`. Mas as páginas do site passaram a `force-dynamic` — logo, **em execução**, o primeiro pedido tocava na base e rebentava. Sem Neon configurado, o site não funcionava. Quem clonasse o repositório não conseguia sequer arrancar.

### A correção: recurso ao estático

A camada de leitura verifica se há credenciais e, quando não há, serve os dados estáticos:

```ts
// src/lib/viaturas.ts
function temBaseDeDados(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getViaturas(): Promise<Viatura[]> {
  if (!temBaseDeDados()) return viaturasEstaticas;
  const linhas = await db.select().from(viaturasTable).orderBy(desc(viaturasTable.criadoEm));
  return linhas.map(rowToViatura);
}
```

O padrão já existe no projeto: o `src/lib/r2.ts` do #12 tem `r2Configurado()` exatamente com esta forma. Aplicar o mesmo à base de dados.

**Comportamento resultante:**

| | Site público | `/admin` |
|---|---|---|
| Sem `DATABASE_URL` | Funciona, com os dados estáticos | Indisponível, com mensagem a explicar |
| Com `DATABASE_URL` | Lê da base | Ativo |

O `/admin` não deve dar erro feio quando não há base — deve dizer que a gestão ainda não está configurada.

## Camada de leitura

`src/lib/viaturas.ts` (server-only) é a **única** porta de entrada aos dados. Substitui o `import { viaturas } from "@/data/viaturas"` espalhado pelos componentes.

Contrato — devolvem sempre o tipo de domínio, venha da base ou do ficheiro:

| Função | Devolve |
|---|---|
| `getViaturas()` | `Promise<Viatura[]>` — todas, mais recente primeiro |
| `getViatura(id)` | `Promise<Viatura \| null>` |
| `getDestaques()` | `Promise<Viatura[]>` — as marcadas como destaque |
| `getSugestoes(id, n)` | `Promise<Viatura[]>` — outras viaturas, para o fim do detalhe |

`rowToViatura(row)` é a fronteira entre a linha da base e o tipo `Viatura`. As colunas de texto livre (segmento, combustível, transmissão, estado de venda) são convertidas para as uniões do tipo — a garantia de que os valores são válidos vem do zod no formulário, não da base.

**`src/data/viaturas.ts` deixa de ser importado pelos componentes.** Passa a ter dois papéis: alimentar o seed inicial da base, e servir de recurso quando não há credenciais.

## `derivados.ts` passa a funções puras

Hoje as funções importam `viaturas` diretamente. Na reintegração recebem a lista por parâmetro — já feito assim no #12:

```ts
export function getMarcas(lista: Viatura[]): Marca[]
export function getModelos(lista: Viatura[], marcaSlug?: string): ModeloOpcao[]
export function getIntervalos(lista: Viatura[]): Intervalos
```

Continuam puras e sem efeitos. Quem as chama é que decide a origem da lista.

## Rotas

```
src/app/
├── (site)/                          site público, com Header e Footer
│   ├── layout.tsx
│   ├── page.tsx
│   ├── viaturas/
│   └── carros/[marca]/[modelo]/[id]/
├── admin/
│   ├── layout.tsx                   sem chrome do site
│   ├── login/                       público
│   ├── (painel)/                    protegido
│   │   ├── layout.tsx               gate de sessão
│   │   ├── page.tsx                 listagem
│   │   └── viaturas/nova · [id]/    formulário
│   ├── actions.ts                   server actions de CRUD
│   └── auth-actions.ts
└── api/auth/[...nextauth]/route.ts
```

O grupo `(site)` existe para o painel **não** herdar o Header, o Footer, o CTA flutuante nem o preloader. São dois produtos com chrome diferente na mesma aplicação.

## Dinamismo — o que o cliente vê mudar

O cliente edita e o site reflete de imediato. Isso implica que as páginas que dependem de dados sejam dinâmicas (`export const dynamic = "force-dynamic"`), em vez de estáticas em build.

Efeitos que se propagam **sozinhos**, sem código adicional, porque tudo deriva da lista de viaturas:

| O cliente faz | O site mostra |
|---|---|
| Adiciona uma viatura | Aparece no catálogo; a página de detalhe passa a existir |
| Adiciona a primeira de uma marca nova | A marca aparece na grelha de marcas da homepage |
| Apaga a última viatura de uma marca | A marca desaparece da grelha |
| Marca como destaque | Entra em "Viaturas em Destaque" |
| Tira o destaque | Sai da secção |
| Marca como reservado ou vendido | O badge aparece no card; se vendido, a foto dessatura e o preço passa a "Vendido" |
| Altera o preço | Os limites do filtro de preço no catálogo ajustam-se |

Este comportamento vem de `derivados.ts` — as opções de filtro, as marcas e os intervalos nascem sempre da lista atual. **Nunca introduzir listas fixas de marcas ou modelos**; quebraria isto.

Nota sobre a grelha de marcas: o logótipo vem do mapa `LOGOS` em `src/lib/marcas.ts`, que é código. Uma marca nova sem logótipo aparece na mesma, com o nome — o `logoMarca()` devolve `null` e a interface faz o recurso. Acrescentar o ficheiro do logótipo é trabalho de programação, não de gestão.

## Slugs

Hoje os slugs estão escritos à mão nos dados. Com o painel, o cliente escreve "Mercedes-Benz" e o slug tem de ser gerado — o #12 acrescentou `slugify()` a `src/lib/slug.ts`:

```ts
"CLA 250" → "cla-250"   ·   "Mercedes-Benz" → "mercedes-benz"
```

Gera-se **na escrita** (na server action, ao gravar), nunca na leitura. Assim o URL fica fixo na base e não muda com alterações à função.

**Atenção:** editar a marca ou o modelo de uma viatura muda o slug e, portanto, o URL da página. Links antigos deixam de funcionar. Documentar o comportamento escolhido na fase de implementação — congelar o slug depois de criado é a opção mais segura.

## Nunca

- **Deixar o site depender da base de dados para arrancar.** Foi o que causou o revert do PR #14.
- **Importar `src/data/viaturas.ts` num componente.** A porta é `src/lib/viaturas.ts`.
- **Pôr listas fixas de marcas, modelos ou combustíveis.** Deriva-se da lista de viaturas.
- **Gerar slugs na leitura.** Gera-se ao gravar e guarda-se.
- **Fazer o painel herdar o chrome do site** — é por isso que existe o grupo `(site)`.
- **Confiar no gate do layout como única proteção.** Ver [03 — Autenticação](03-autenticacao.md).
