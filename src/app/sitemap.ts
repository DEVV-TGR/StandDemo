import type { MetadataRoute } from "next";
import { urlViatura } from "@/lib/slug";
import { SITE_URL, urlAbsoluto } from "@/lib/site";
import { getViaturas } from "@/lib/viaturas";

/**
 * Gera `/sitemap.xml`. Sem isto o Google dependia exclusivamente de links
 * externos para descobrir o site — e existe um único.
 *
 * O `lastModified` sai do `atualizadoEm` de cada viatura, escrito pelo painel
 * a cada edição. Nunca da data do build: um `lastmod` que muda a cada deploy
 * sem o conteúdo mudar é um `lastmod` que o Google aprende a ignorar — e
 * perde-se o sinal justamente no dia em que a página muda mesmo.
 *
 * Quando a base não responde, o site serve o inventário estático, que não tem
 * datas. Nesse caso o campo fica de fora, que é melhor do que uma data errada.
 */
/**
 * Data em que o cliente aprovou os Termos e a Política de Privacidade.
 *
 * Passou de 26/08 para 02/09 quando os dois textos foram revistos para cobrir
 * os formulários de «Compramos» e «Importamos», e daí para 05/09 quando o
 * cliente fechou os custos e o sinal das viaturas por encomenda — a data é a
 * do texto mais recente, não a do deploy, e por isso muda quando o texto muda.
 */
const LEGAIS_APROVADAS_EM = new Date("2026-09-05T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const viaturas = await getViaturas();

  /*
    Para a home e o catálogo, a data mais recente do inventário. As duas
    páginas são listas do que existe: mudam exactamente quando muda uma
    viatura, e não têm data própria de onde a tirar.
  */
  const alteracoes = viaturas
    .map((v) => v.atualizadoEm)
    .filter((d): d is Date => d instanceof Date);

  const maisRecente = alteracoes.length
    ? new Date(Math.max(...alteracoes.map((d) => d.getTime())))
    : undefined;

  return [
    {
      url: SITE_URL,
      lastModified: maisRecente,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: urlAbsoluto("/viaturas"),
      lastModified: maisRecente,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      // Sem `lastModified`: a página de contactos não muda com o inventário, e
      // dar-lhe a data dele era dizer ao Google que mudou quando não mudou.
      url: urlAbsoluto("/contactos"),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    },
    /*
      As duas páginas de pedidos. Sem `lastModified` pela mesma razão que a de
      contactos: são páginas de serviço, não mudam com o inventário.
    */
    ...["/compramos", "/importamos"].map((caminho) => ({
      url: urlAbsoluto(caminho),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    /*
      As legais. `lastModified` é a data da aprovação do cliente, escrita à
      mão: é a data em que o texto passou a ser o que é, e não muda enquanto o
      texto não mudar. Se um dia se alterar uma cláusula, muda-se aqui também.
    */
    ...["/termos", "/privacidade"].map((caminho) => ({
      url: urlAbsoluto(caminho),
      lastModified: LEGAIS_APROVADAS_EM,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...viaturas.map((v) => ({
      url: urlAbsoluto(urlViatura(v)),
      lastModified: v.atualizadoEm,
      changeFrequency: "weekly" as const,
      // Viaturas vendidas continuam no sitemap, com prioridade menor: a página
      // mantém-se útil (links partilhados no WhatsApp) e sinaliza SoldOut.
      priority: v.estadoVenda === "vendido" ? 0.4 : 0.8,
      images: [urlAbsoluto(v.fotos[0])],
    })),
  ];
}
