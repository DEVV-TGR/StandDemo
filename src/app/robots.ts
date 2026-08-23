import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Gera `/robots.txt`. Até aqui o endpoint devolvia 404 — o que não bloqueava
 * o rastreio (o Google lê ausência como permissão total), mas deixava o site
 * sem forma de declarar o sitemap.
 *
 * `/admin/` existe desde a reorganização em grupos de rotas, para já só como
 * esqueleto. Fica excluído daqui, e o layout do painel declara `noindex` por
 * si — duas defesas que custam uma linha cada e falham por motivos
 * diferentes: esta depende de o robô ler o ficheiro, a outra não.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
