# 07 — Voz e conteúdo

> **Aplica-se a** — todo o texto visível, formatação de números, datas e moeda.
> **Fonte de verdade** — `src/lib/format.ts`, `src/data/stand.ts`.
> **Ler antes de** — escrever qualquer string de interface ou mostrar um número.

## PT-PT, sem exceções

Todo o conteúdo visível é português europeu. `lang="pt-PT"` no `<html>`, `openGraph.locale: "pt_PT"`, `Intl` sempre com `"pt-PT"`, ordenação alfabética sempre com `localeCompare(…, "pt")`.

Isto vale para o texto que o utilizador lê. As convenções de nomenclatura de código estão em [09](09-codigo-e-arquitetura.md) e são mistas de propósito.

Acentuação e cedilha corretos sempre — em código, em comentários e em dados. `Quilómetros`, `Combustível`, `Transmissão`, `Automática`, `Híbrido`, `Elétrico`, `Coupé`, `Dedutível`.

## Formatação

**Nunca formatar à mão.** Usar as seis funções de `src/lib/format.ts`, que partilham duas instâncias de `Intl.NumberFormat`:

```ts
const euros  = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const numero = new Intl.NumberFormat("pt-PT");
```

| Função | Entrada | Saída |
|---|---|---|
| `formatarPreco(42000)` | preço | `42 000 €` |
| `formatarNumero(161860)` | qualquer | `161 860` |
| `formatarKm(161860)` | quilómetros | `161 860 km` |
| `formatarRegisto(7, 2017)` | mês, ano | `Jul. 2017` |
| `formatarData(d)` | `Date` | `24 Ago. 2026` |
| `formatarDataRelativa(d)` | `Date` | `hoje`, `ontem`, `há 3 dias`, `24 Ago. 2026` |
| `formatarPotencia(258)` | cavalos | `258 cv` |
| `formatarCilindrada(2967)` | cc | `2 967 cc` |

Detalhes que importam:

- **Preços sem casas decimais** (`maximumFractionDigits: 0`). Um stand não anuncia `42 000,00 €`.
- **Meses abreviados levam ponto** — `MESES_ABREV` é `["Jan.", "Fev.", "Mar.", …]`. Nunca `Jul` sem ponto.
- **Unidades em minúsculas** — `cv` e `cc`, não `CV` nem `CC`.
- O separador de milhares em `pt-PT` é o espaço fino, não o ponto. Vem do `Intl`; não o reproduzir à mão.
- **As datas contam-se no fuso de Lisboa**, não no do servidor. `getDate()` e companhia dariam o dia em UTC, e uma viatura publicada às 00h30 de Agosto apareceria como sendo de ontem a quem a acabou de publicar.
- **`formatarDataRelativa` só vale até um mês.** A partir daí devolve a data por extenso — `há 47 dias` já não diz nada a ninguém. Onde é usada, a data exacta fica no `title`.

## Pluralização é manual

Não há biblioteca de i18n. Cada plural é escrito com um ternário, e **é obrigatório** — "1 resultados" estraga a credibilidade de uma demo.

Os cinco pares em uso:

```tsx
{total} {total === 1 ? "viatura" : "viaturas"} em stock
{resultados === 1 ? "resultado" : "resultados"}
{resultados.length === 1 ? "viatura encontrada" : "viaturas encontradas"}
```

Ao acrescentar uma contagem nova, escrever o ternário.

## Vocabulário fixo

Termos que já estão decididos. Usar estes, não sinónimos:

| Termo | Nota |
|---|---|
| **Viatura**, não "carro" | Registo do setor. `viaturas`, `Todas as viaturas`, `Ver viaturas` |
| **Ver N resultados** | Botão da pesquisa rápida do hero |
| **Limpar Parâmetros** | Botão de reset dos filtros |
| **Ordenar por** | Rótulo do select de ordenação |
| **Também vai gostar destas** | Secção de sugestões no detalhe |
| **Fale connosco** / **Fale agora** | CTA do header / CTA flutuante |
| **Ficha técnica**, **Extras e equipamento** | Headings do detalhe |
| **Informação adicional** | O `<details>` com matrícula e VIN |
| **Sem resultados para já** | Empty state |
| **Todos** / **Todas** | Opção vazia dos selects, concordando em género |
| **Sim** / **Não** | Booleanos na ficha técnica (`simNao()`) |

Rótulos de ordenação, tal como estão em `ORDENACOES`: `Relevância`, `Preço: mais baixo`, `Preço: mais alto`, `Ano: mais recente`, `Ano: mais antigo`, `Quilómetros: menos`.

Estados de carregamento em `sr-only`: `A carregar`, `A carregar página`, `A carregar viaturas` — gerúndio composto português (`a carregar`), nunca `carregando`.

## Dados do stand

`src/data/stand.ts` é a **fonte única** de morada, contactos, horários e textos institucionais. Nunca escrever um telefone ou uma morada diretamente num componente.

```ts
nome, slogan, morada, codigoPostal, telefone, telefoneNota,
telemovel, telemovelNota, email, instagram, mapsUrl, horarios[], sobre[]
```

Convenções internas:

- **Telefones formatados com espaços** (`936 498 610`) e convertidos para `tel:` com `+351` e `replaceAll(" ", "")`.
- **`telefoneNota` / `telemovelNota`** — "Chamada para a rede móvel nacional". Exigência legal em Portugal; não remover.
- **Horários** usam `·` como separador de períodos e travessão `–` (meia-risca) nas horas: `09:30 – 13:00 · 14:30 – 19:00`.
- **`sobre`** é um array de parágrafos, não uma string com `\n`.

## Crédito da agência

`src/data/agencia.ts` guarda quem desenvolveu o site (`nome`, `url`). Está separado do `stand.ts` de propósito: **os dados do stand mudam de cliente para cliente, o crédito não** — viaja com o molde quando este servir outro cliente.

Aparece uma vez, no fecho do rodapé, a seguir ao copyright do cliente:

```
© 2026 Imperio Auto Concept · Desenvolvido por DevPlus ↗
```

Numa linha em ecrãs largos, empilhado em telemóvel. O separador `·` é `text-gold-deep`, como nos metadados das viaturas, e some no empilhamento. O link segue o padrão dos externos: `target="_blank" rel="noreferrer"` e a seta `↗`.

O copyright é sempre do **cliente** — é ele o dono do site. O crédito é uma assinatura discreta, não uma segunda marca.

## Metadata

Definida em `src/app/layout.tsx` e por página. O template de título é `"%s | Imperio Auto Concept"`. A página de detalhe gera título e descrição por viatura em `generateMetadata`, incluindo a primeira foto no Open Graph.

## Nunca

- **Strings em inglês visíveis** ao utilizador.
- **Formatar números, preços ou datas à mão.** Usar `src/lib/format.ts`.
- **`toLocaleString()` sem locale** — herda o do browser e quebra a consistência.
- **Escrever meses abreviados sem ponto** (`Jul` em vez de `Jul.`).
- **Unidades em maiúsculas** (`CV`, `CC`, `KM`).
- **Contagens sem ternário de plural.**
- **Contactos ou morada hard-coded** num componente — vêm de `stand.ts`.
- **Remover as notas de custo de chamada.**
- **Ordenar listas sem `localeCompare(…, "pt")`** — sem isso, "Á" e "A" ordenam mal.
