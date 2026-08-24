# 05 — UX do painel

> **Aplica-se a** — o que o cliente vê e faz dentro de `/admin`.
> **Fonte de verdade** — este documento; a implementação anterior em `git show 'bf14fed:src/app/admin/(painel)/page.tsx'`.
> **Ler antes de** — construir qualquer ecrã do painel.

## Quem usa isto

O dono do stand, no computador ou no telemóvel, provavelmente com pressa e sem paciência para descobrir como funciona. Não é programador e não vai ler instruções.

Daí os três princípios:

1. **Ver tudo de relance.** A primeira coisa que aparece é a lista de anúncios, não um menu.
2. **Cada ação óbvia.** Editar é um lápis. Apagar é um caixote. Sem menus escondidos.
3. **Dizer o que vai acontecer no site.** O cliente não pensa em "campos" — pensa em "pôr em destaque" e "marcar como vendido". Os controlos devem falar assim.

## Ecrã principal — a listagem

O modelo é o gestor de vídeos do YouTube Studio: uma linha por anúncio, com o essencial visível e as ações à direita.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Viaturas                                        [ + Adicionar ]     │
│  6 anúncios publicados                                               │
├──────────────────────────────────────────────────────────────────────┤
│  VIATURA                    ESTADO       PREÇO      REGISTO   AÇÕES  │
├──────────────────────────────────────────────────────────────────────┤
│  [foto] Porsche Macan     ● Disponível   42 000 €   Jul. 2017  ✏  🗑 │
│   ★     S                                                            │
├──────────────────────────────────────────────────────────────────────┤
│  [foto] MINI Cooper D     ● Vendido       6 000 €   Nov. 2011  ✏  🗑 │
│         3 Portas                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

**Cada linha tem:** miniatura da primeira foto, marca e modelo, versão por baixo, estado de venda, preço, registo, e as ações.

**Marcador de destaque:** um ponto dourado no canto da miniatura, com `title="Em destaque"`. O cliente vê de relance quais estão na homepage.

**Ordenação:** mais recente primeiro, por `criadoEm`. É por isso que o schema tem essa coluna.

**Ações — ícones, não texto.** A implementação do #12 usava as palavras "Editar" e "Apagar"; passa a ícone de **lápis** e de **caixote do lixo**, como pedido. Requisitos: `aria-label` em cada um (a etiqueta acessível continua a ser texto), `title` para a dica ao passar o rato, e área de toque de pelo menos 44×44 px no telemóvel.

**Botão "Adicionar viatura"** em evidência, no topo à direita, em dourado.

**Sem anúncios:** estado vazio com uma frase e o botão de adicionar ao centro — não uma tabela vazia.

**No telemóvel** a tabela não cabe. Passar a cartões empilhados, com a foto, o nome, o estado e as duas ações. Não deixar a tabela em deslize horizontal como única solução.

## Apagar

Pede confirmação, com o nome da viatura na pergunta e o aviso de que as fotos também desaparecem:

> Apagar "Porsche Macan S"? Esta ação remove o anúncio e as respetivas fotos e não pode ser desfeita.

Não há desfazer nem lixo de recuperação — por isso a confirmação tem de nomear o que se vai perder. Enquanto apaga, o botão mostra estado de espera.

## Formulário

Um só formulário para criar e editar, dividido em secções para não ser um muro de campos:

| Secção | Campos |
|---|---|
| **Identificação** | Marca, Modelo, Versão, Preço |
| **Ficha técnica** | Registo (mês/ano), Quilómetros, Combustível, Potência, Cilindrada, Transmissão, Segmento, Lugares, Portas, Cor, Cor interior |
| **Documentação** | Origem, Estado, Garantia, Livro de revisões, 2.ª chave, Classe de portagem, Matrícula, VIN |
| **Descrição** | Texto livre |
| **Extras** | Categorias, cada uma com a sua lista de itens |
| **Fotos** | Carregar, remover, reordenar |
| **Publicação** | Estado de venda, Destaque, IVA dedutível |

São os 30 campos de `Viatura` — ver [`docs/brand/08`](../brand/08-dados-e-dominio.md). Todos obrigatórios no tipo, mas o schema do #12 dá valores por omissão aos menos críticos, para o cliente conseguir publicar sem preencher tudo.

**Marca e modelo:** campo de texto com sugestões das marcas e modelos já existentes. Escrever livremente tem de continuar possível — é assim que entra uma marca nova — mas sugerir evita "BMW" e "Bmw" como duas marcas distintas. O slug é gerado ao gravar, com o `slugify()`.

**Fotos:** a ordem importa, porque a primeira é a que aparece no card e nos resultados de pesquisa — a primeira vem assinalada como capa, e as outras mostram o número da posição.

Reordenar é **por botões, sempre visíveis**: `←` e `→` trocam com a foto ao lado, e "Capa" salta uma foto directamente para primeiro — sem esse atalho, pôr a foto 22 na capa eram 21 toques. Cada botão ocupa um terço da largura da célula e tem 44 px de altura, o que dá alvos acima dos 44 px mesmo num ecrã de 320 px. Depois de cada troca, a nova posição é anunciada por `aria-live`.

**Não estão atrás de `hover`.** No Tailwind v4 todo o `hover:` nasce dentro de `@media (hover: hover)`, portanto num telemóvel a regra não existe de todo e o controlo desaparece. Apagar fica no canto oposto da célula, longe dos botões de mover, e é reversível por "Anular" em vez de confirmado à cabeça — trinta fotos seriam trinta diálogos.

**Arrastar não se oferece**, e é decisão, não esquecimento. Chegou a estar implementado e saiu. Fica aqui o que custa, para quem o quiser trazer de volta saber ao que vai: a API nativa de HTML5 (`draggable`/`drop`) não funciona por toque no Safari iOS nem no Chrome Android, portanto é preciso Pointer Events; o `touch-action` é resolvido no instante em que o toque começa, logo o arrasto tem de viver numa pega dedicada com `touch-action: none` — um "long-press e depois arrasta" não funciona; o auto-scroll que traz o destino ao ecrã luta contra o próprio gesto se não for travado; e nada disto é alcançável por teclado ou leitor de ecrã, pelo que os botões teriam de ficar de qualquer maneira.

Ver os limites de tamanho e de quantidade em [04 — Segurança](04-seguranca.md).

**Validação** com zod (`src/lib/viatura-schema.ts` do #12), a mesma no cliente e no servidor. Erros junto ao campo, em português, e ao submeter com erros levar o foco ao primeiro campo com problema.

## Os controlos que o cliente mais usa

Estes três são o dia a dia. Cada um mostra o efeito em texto, ao lado:

**Estado de venda** — três opções:

| Opção | O que acontece no site |
|---|---|
| Disponível | Sem badge; aparece normalmente |
| Reservado | Badge dourado "Reservado" sobre a foto |
| Vendido | Badge vermelho "Vendido", a foto perde cor e o preço passa a "Vendido" |

**Destaque** — interruptor:
> Ligado, aparece em "Viaturas em Destaque" na página inicial.

**IVA dedutível** — interruptor:
> Ligado, mostra o selo "IVA Dedutível" no anúncio.

Estas frases vão na interface, não só nesta documentação. É o que evita o telefonema a perguntar o que é o destaque.

Detalhe do comportamento: ver [`docs/badges-estado.md`](../badges-estado.md).

## Regras de design

**O painel é ferramenta; o site é montra.** Herda a identidade, não a encenação.

**Aplica-se** — os tokens de cor de [`docs/brand/02`](../brand/02-cor-e-materia.md) (`bg-surface`, `border-line`, `text-muted`, dourado para ação); as fontes de [`03`](../brand/03-tipografia.md); o foco dourado global; o português europeu e a formatação com `Intl` de [`07`](../brand/07-voz-e-conteudo.md); e o checklist de acessibilidade de [`05`](../brand/05-componentes.md).

**Não se aplica** — a assinatura editorial. Sem headings com a última palavra em itálico dourado, sem `.text-gold-metal`, sem entradas em scroll, sem carrosséis. Um painel de gestão que se anima a cada scroll é irritante ao fim de dez minutos.

**Diverge de propósito** — densidade maior (linhas compactas, menos espaço em branco) e cantos menos arredondados que no site, porque a leitura aqui é tabular.

**Ponto a resolver na implementação:** a listagem do #12 usa `emerald-500` e `red-400`, cores cruas do Tailwind fora dos tokens do projeto. Para os estados fazem falta um verde e um vermelho semânticos — o `--red*` já existe em `globals.css` desde o PR #17. Acrescentar um verde aos tokens e usar os dois, em vez de cores soltas.

## Nunca

- **Fazer da listagem um menu.** Abre no que interessa: os anúncios.
- **Esconder ações em menus de contexto.** Lápis e caixote, visíveis.
- **Esconder um controlo atrás de `hover`.** No Tailwind v4 o `hover:` está dentro de `@media (hover: hover)`; num telemóvel a regra não existe e o controlo desaparece. E `opacity-0` sem `pointer-events-none` deixa-o clicável às cegas.
- **Alvos de toque abaixo de 44 px** nos controlos que se usam a sério.
- **Apagar sem confirmação nomeada.**
- **Deixar a tabela em deslize horizontal** como única resposta ao telemóvel.
- **Trazer a linguagem editorial do site** — itálicos dourados, ouro metálico, animações de entrada.
- **Usar cores fora dos tokens** para os estados.
- **Mostrar erros de validação em inglês** ou sem indicar o campo.
- **Pôr um controlo de publicação sem explicar o efeito** ao lado.
