# Sistema de design — StandDemo

Documentação da linguagem visual e das convenções do projeto. **Descreve o que o código faz hoje**, não intenções: cada regra foi extraída de `src/` e os valores são literais.

Serve dois leitores: um agente que precisa de escrever código consistente sem reler o `src/` inteiro, e uma pessoa que retoma o projeto passado algum tempo.

## Como usar

Antes de tocar em interface, ler o documento do domínio em causa. Cada ficheiro abre com um bloco de três linhas — *Aplica-se a*, *Fonte de verdade*, *Ler antes de* — e fecha com **`## Nunca`**, a lista do que não se faz neste projeto.

Quando o código e a documentação divergirem, **o código ganha** — e o documento deve ser corrigido no mesmo commit. As divergências internas já conhecidas estão registadas em secções `## Dívida conhecida`; estão documentadas de propósito, não escondidas.

## Índice

| Documento | O que responde |
|---|---|
| [01 — Produto e âmbito](01-produto-e-ambito.md) | O que é a demo, o que entra e o que fica de fora |
| [02 — Cor e matéria](02-cor-e-materia.md) | Tokens OKLCH, hierarquia do dourado, superfícies, ouro metálico |
| [03 — Tipografia](03-tipografia.md) | As três fontes, a escala fluida, os seis papéis tipográficos |
| [04 — Layout e espaço](04-layout-e-espaco.md) | Container, ritmo vertical, grelhas, breakpoints, z-index |
| [05 — Componentes](05-componentes.md) | Contratos dos componentes e padrões transversais de UI |
| [06 — Movimento](06-movimento.md) | Easing canónico, entrada em scroll, gestos, reduced motion |
| [07 — Voz e conteúdo](07-voz-e-conteudo.md) | PT-PT, formatação com `Intl`, pluralização, vocabulário |
| [08 — Dados e domínio](08-dados-e-dominio.md) | O tipo `Viatura`, o inventário, os helpers de filtro |
| [09 — Código e arquitetura](09-codigo-e-arquitetura.md) | Next.js 16, Tailwind v4, nomenclatura, estado dos filtros |

## As dez regras não-negociáveis

O resumo executivo. Cada uma está desenvolvida no documento respetivo.

1. **Tema escuro, sempre.** Não há light mode, não há `dark:`. `color-scheme: dark` é fixo.
2. **O dourado é cor de ação e realce** — CTAs, bordas ativas, hover, detalhes finos. Nunca preenche áreas grandes.
3. **As fotos das viaturas são o elemento dominante.** Tudo o resto é moldura.
4. **Headings são Bodoni com a última palavra em itálico dourado.** É a assinatura tipográfica do site — 11 secções seguem-na.
5. **Tudo é redondo.** `rounded-full` em botões, chips, badges e indicadores (31 usos); `rounded-2xl` em cards (10).
6. **Hover: texto vai a `gold-bright`, bordas vão a `gold`.** 23 e 14 usos, sem exceções.
7. **O divisor decorativo é `.hairline`.** Nunca `<hr>`, nunca `border-t` para separar visualmente.
8. **Glifos de texto em vez de ícones** — `‹ › → ↗ ✕ ▾ ◆ · ⤢ ✓`. Só existem 4 SVGs inline no projeto inteiro.
9. **Conteúdo em PT-PT**, formatado por `Intl` com locale `pt-PT`. Pluralização é manual e obrigatória.
10. **Sem bibliotecas de utilidade de classes.** Não há `clsx`, `cva` nem `tailwind-merge` — composição por template strings.

## Relação com `AGENTS.md`

O [`AGENTS.md`](../../AGENTS.md) na raiz é o ponto de entrada curto: identidade do projeto, stack, skills e a regra do Next.js 16. Todo o detalhe de design e convenções vive aqui.
