import type { MetadataRoute } from "next";
import { urlViatura } from "@/lib/slug";
import { SITE_URL, urlAbsoluto } from "@/lib/site";
import { getViaturas } from "@/lib/viaturas";

/**
 * Gera `/sitemap.xml`. Sem isto o Google dependia exclusivamente de links
 * externos para descobrir o site — e existe um único.
 *
 * Sem `lastModified`: o inventário ainda não tem data de alteração por
 * viatura. Um `lastmod` com a data do build mudaria
 * a cada deploy sem o conteúdo mudar, o que o Google aprende a ignorar.
 * Quando o painel /admin trouxer `atualizadoEm`, passa a ser preenchido aqui.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const viaturas = await getViaturas();

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    {
      url: urlAbsoluto("/viaturas"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: urlAbsoluto("/contactos"),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    },
    ...viaturas.map((v) => ({
      url: urlAbsoluto(urlViatura(v)),
      changeFrequency: "weekly" as const,
      // Viaturas vendidas continuam no sitemap, com prioridade menor: a página
      // mantém-se útil (links partilhados no WhatsApp) e sinaliza SoldOut.
      priority: v.estadoVenda === "vendido" ? 0.4 : 0.8,
      images: [urlAbsoluto(v.fotos[0])],
    })),
  ];
}
