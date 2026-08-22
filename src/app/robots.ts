import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Gera `/robots.txt`. Até aqui o endpoint devolvia 404 — o que não bloqueava
 * o rastreio (o Google lê ausência como permissão total), mas deixava o site
 * sem forma de declarar o sitemap.
 *
 * `/admin/` ainda não existe; está aqui de propósito, para o painel de gestão
 * planeado em docs/admin/ nunca chegar a ser rastreado.
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
