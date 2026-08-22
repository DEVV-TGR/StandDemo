# SEO — estado e convenções

> **Aplica-se a** — metadata, indexação, dados estruturados, páginas legais.
> **Fonte de verdade** — `src/lib/site.ts`, `src/lib/seo.ts`, `src/lib/jsonld.ts`, `src/app/{robots,sitemap,opengraph-image}.ts(x)`.
> **Ler antes de** — criar uma rota, mexer em titles/descriptions ou tocar nos dados do stand.

Implementação do plano em `seo-imperio-auto-concept.md` (21/08/2026). Aqui fica o que
está feito, o que ficou de fora e porquê, e o que não se resolve no repositório.

## O diagnóstico, confirmado

Auditoria feita contra o site em produção antes de escrever código:

| Verificação | Antes |
|---|---|
| `/robots.txt` | 404 |
| `/sitemap.xml` | 404 |
| `rel="canonical"` | ausente em todas as páginas |
| JSON-LD | nenhum |
| `og:image` das viaturas | `https://imperioautoconcept.pt/...` — domínio sem registo DNS |
| `og:image` da homepage | ausente |
| `noindex` / `X-Robots-Tag` | ausentes |
| Variantes de domínio | `.com` e `http://` já redirecionavam 308 para `https://www.` |
| 404 | devolvia HTTP 404 correto |

Não havia bloqueio de rastreio. Havia ausência de sinais de descoberta: sem
sitemap, sem canonicals e com um único link externo a apontar para o site.

## Regras ao escrever código

**O domínio vive em `src/lib/site.ts`.** `SITE_URL` é `https://www.imperioautoconcept.com`
— com `www`, que é a variante para onde a Vercel já redireciona. Nunca escrever
um domínio à mão.

**Cada rota declara o seu canonical.** Nunca no layout raiz: o merge de metadata
do Next é *shallow*, e um canonical herdado apontaria todas as páginas para `/`.

**O bloco `openGraph` constrói-se com `openGraphRota()`.** Pela mesma razão: uma
página que declare `openGraph` substitui o objeto inteiro do layout, perdendo
`siteName`, `locale` e a imagem por omissão. Foi assim que `/viaturas` ficou sem
`og:image` até o `check:seo` dar por isso.

**Titles e descriptions passam por `seoTitulo()` / `seoDescricao()`.** Os textos
vêm do inventário e um modelo com nome comprido rebenta os limites sozinho. O
`clamp` corta pela palavra e, de caminho, normaliza os espaços finos do `Intl`
que de outro modo chegariam ao HTML como `&nbsp;`.

**Só se marca em JSON-LD o que está visível na página.** É regra do Google e é a
razão de não haver `geo` (coordenadas não confirmadas) nem o Facebook no
`sameAs` (o link é um shortlink `/share/`, instável).

**O NAP vem sempre de `src/data/stand.ts`** — `enderecoLinha`, `telHref()`,
`horasTexto()`. Nome, morada e telefone têm de ser idênticos ao Perfil de
Empresa do Google, e cada cópia no código é uma oportunidade de divergir.

## Validação

```bash
npm run build && npx next start -p 3000
npm run check:seo          # ou BASE_URL=https://... npm run check:seo
```

Lê o sitemap, visita cada página e falha se houver title/description em falta,
duplicados ou fora de medida, canonical não auto-referencial, `og:image` em
falta, `noindex` numa página do sitemap, ou mais do que um `<h1>`.

## Fora do âmbito, por decisão

**Rotas por marca (`/viaturas/bmw`).** Adiadas. Com 6 viaturas e 5 marcas, cada
página teria uma ou duas viaturas — *thin content*, que é sinal negativo. Vale a
pena a partir de ~20 viaturas em stock.

**Analytics.** Nada instalado, por decisão. Sem cookies de seguimento não é
preciso banner de consentimento. Se entrar alguma medição, atualizar
`/privacidade` e avaliar a exigência de consentimento prévio.

**Política de Privacidade.** A página existe em `/privacidade`, com `noindex`,
fora do sitemap e sem link no rodapé. É um esqueleto: o texto tem de ser
validado juridicamente antes de publicar. Instruções no cabeçalho do ficheiro.

**`w=3840` nas miniaturas.** Não se confirmou. O único pedido de 3840px na
página é o hero, que usa `sizes="100vw"` e é a imagem de LCP — está correto.
Todas as `<Image fill>` do projeto já declaram `sizes`.

## Por confirmar com o cliente

| Item | Bloqueia |
|---|---|
| Código postal completo (`4300-XXX`) | endereço no JSON-LD e consistência do NAP |
| Coordenadas GPS do stand | `geo` no JSON-LD |
| URL canónico da página de Facebook (não o shortlink) | `sameAs` no JSON-LD |
| Designação social, NIF e morada da sede | `/privacidade` |
| Prazos de conservação de dados | `/privacidade` |
| Empresa registada na plataforma do Livro de Reclamações? | cumprimento da obrigação legal |
| Logótipo oficial do Livro de Reclamações | forma habitual da divulgação |
| Manter VIN e matrícula públicos? | ficha técnica e JSON-LD (hoje estão publicados) |

## Não se resolve no repositório

1. **Perfil de Empresa do Google.** Para um stand, o Maps supera o orgânico em
   intenção comercial local. É gratuito. Sem isto, todo o trabalho técnico tem
   um teto baixo.
2. **Search Console** como propriedade de *domínio* (verificação por TXT no
   DNS), não de prefixo de URL. Submeter o sitemap e pedir indexação das nove
   páginas.
3. **Colisão de marca.** Existem o Império Automóvel (Trofa) e o Império Centro
   Auto (Braga), ambos com presença muito maior. Para "império auto porto" o
   incumbente ganha, independentemente da qualidade técnica do site. A aposta
   realista é o nome completo, "Império Auto Concept".
4. **Agregadores.** Standvirtual, OLX e Piscapisca dominam a pesquisa de usados
   em Portugal — são o canal de aquisição real e a fonte de backlinks mais
   acessível.
5. **Expectativa a comunicar.** O objetivo de curto prazo é posição 1 para o
   nome da marca e presença no Maps. Com 6 viaturas não há massa crítica para
   termos genéricos.

## Nota sobre dados estruturados

O rich result dedicado a listagens de veículos foi descontinuado pelo Google em
2025. O JSON-LD mantém-se por outra razão — compreensão de entidade, motores de
resposta e Bing — mas não se deve prometer cartões de viatura na SERP.
