# 01 — Produto e âmbito

> **Aplica-se a** — decisões sobre o que construir, e sobretudo sobre o que não construir.
> **Fonte de verdade** — `src/app/` (as rotas que existem), `src/data/viaturas.ts` (o inventário).
> **Ler antes de** — propor funcionalidades novas, alargar páginas ou acrescentar secções.

## O que é

Site de demonstração de um **stand de automóveis**, para apresentar a um cliente. O cliente representado é a **Imperio Auto Concept** (Porto) — dados reais em `src/data/stand.ts`, fotografias reais dos anúncios do stand.

A tensão central do projeto: **qualidade visual de nível profissional, âmbito deliberadamente pequeno**. É uma demo destinada a impressionar numa apresentação, não um produto a escalar. Investir em acabamento; não investir em generalidade.

Sem backend. Sem base de dados. Sem autenticação. Os dados são mock em TypeScript.

## As três páginas

| Rota | Ficheiro | O que tem |
|---|---|---|
| `/` | `src/app/page.tsx` | Hero com pesquisa rápida e contagem live, Viaturas em Destaque (carrossel), grelha de Marcas, secção sobre/contactos |
| `/viaturas` | `src/app/viaturas/page.tsx` | Pesquisa detalhada com contagem live e "Limpar Parâmetros", chips de filtros ativos, grelha de cards, "Ordenar por" |
| `/carros/[marca]/[modelo]/[id]` | `src/app/carros/.../page.tsx` | Galeria com lightbox, ficha técnica completa, extras por categoria, cartão-resumo sticky, sugestões |

Mais `src/app/not-found.tsx` e `src/app/viaturas/loading.tsx`.

A página de detalhe é a **mais trabalhada das três** — é onde a demo se prova. Tem rotas estáticas geradas em build (`generateStaticParams`) e metadata dinâmica por viatura (`generateMetadata`, com Open Graph e a primeira foto).

## Inspirações

- **[pintoesousa.com/viaturas/usadas](https://www.pintoesousa.com/viaturas/usadas)** — referência para o registo visual premium e para a listagem/pesquisa.
- **[niceportocar.pt](https://www.niceportocar.pt)** — referência para a estrutura da homepage.

Ambos correm na mesma plataforma white-label, pelo que partilham funcionalidades. **A regra é replicar as funcionalidades, não o layout.** Aqueles sites são Bootstrap genérico; o StandDemo tem identidade própria e existe precisamente para elevar o nível.

Funcionalidades que definem a categoria e que o projeto implementa:

- Pesquisa rápida no hero (Marca, Modelo, Combustível) com **contagem de resultados em tempo real** no botão.
- Pesquisa detalhada: intervalos de Preço, Ano e Quilómetros por slider duplo; dropdowns de Transmissão, Combustível e Segmento; "Limpar Parâmetros".
- Cards com carrossel de fotos, badges de estado e a linha de meta `Mês/Ano · Combustível · Km`.
- Grelha de marcas cujos logótipos filtram a listagem.

## Fora de âmbito

Omitir, ou deixar como navegação decorativa sem destino real:

- Motos, notícias, galeria institucional
- Intermediação de crédito e simuladores de financiamento
- Multi-stand
- Comparador de viaturas
- Geração real de PDF (o botão "Imprimir" chama `window.print()`, e é suficiente)

Se uma destas aparecer num pedido, confirmar antes de construir — muito provavelmente é âmbito a mais para uma demo.

## Estado atual do inventário

Seis viaturas, cinco marcas. Números concretos em [08 — Dados e domínio](08-dados-e-dominio.md).

Duas notas com efeito visível na UI:

- **O MINI Cooper D (`v-0006`) está `vendido`.** Logo o badge vermelho metálico e o tratamento de dessaturação estão ativos e visíveis no site — não são código morto.
- **Nenhuma viatura está `reservado` e nenhuma tem `ivaDedutivel: true`.** Esses dois badges existem, estão implementados e testados, mas não renderizam com os dados atuais. Ao mexer neles, alterar temporariamente uma viatura para os ver.

## Nunca

- Acrescentar backend, base de dados ou autenticação — a demo não os tem por decisão, não por falta de tempo.
- Construir funcionalidades da lista "fora de âmbito" sem confirmar primeiro.
- Copiar o layout dos sites de inspiração; replicar a funcionalidade, elevar a execução.
- Alargar o inventário sem preencher a ficha técnica **completa** da viatura nova — todos os 30 campos de `Viatura` são obrigatórios.
