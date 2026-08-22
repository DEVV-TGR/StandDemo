/**
 * Identidade do site em produção. Fonte de verdade única para tudo o que é
 * metadata: `metadataBase`, canonicals, sitemap, robots e JSON-LD.
 *
 * O domínio é `.com` com `www` — a variante sem `www` e o `http://` já
 * redirecionam 308 na Vercel. O `.pt` nunca existiu (não está registado);
 * esteve durante meses no `metadataBase`, o que fez com que todas as
 * partilhas em WhatsApp e Facebook apontassem a imagem para um domínio morto.
 */
export const SITE_URL = "https://www.imperioautoconcept.com";

/**
 * Grafia correta em português, usada em metadata, JSON-LD e texto visível.
 * O logótipo é um wordmark gráfico ("IMPERIO" em maiúsculas) e mantém-se como
 * está; slugs, domínios e handles ficam também sem acento.
 */
export const SITE_NAME = "Império Auto Concept";

/** Localidade do stand — entra em titles e descriptions por ser negócio local. */
export const SITE_LOCALIDADE = "Porto";

/** Caminho relativo → URL absoluto. JSON-LD e sitemap não aceitam relativos. */
export function urlAbsoluto(caminho: string): string {
  return new URL(caminho, SITE_URL).toString();
}
