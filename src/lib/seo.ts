import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

/**
 * Limites de comprimento para titles e descriptions.
 *
 * O Google trunca por largura em píxeis, não por caracteres — estes valores
 * são heurísticas seguras. O que os torna necessários é o conteúdo dinâmico:
 * um `Mercedes-Benz CLA 220 d 4Matic OrangeArt Edition 2015` rebenta qualquer
 * limite, e o sufixo da marca ainda acrescenta 23 caracteres.
 */
export const LIMITES = { title: 60, description: 160 } as const;

/** Sufixo que o `title.template` do layout raiz acrescenta a cada página. */
export const SUFIXO_TITULO = ` | ${SITE_NAME}`;

/** Espaço útil para um título de página, já descontado o sufixo do template. */
export const MAX_TITULO_PAGINA = LIMITES.title - SUFIXO_TITULO.length;

/**
 * Corta no último espaço antes do limite, para não partir palavras a meio.
 * Se o corte cair demasiado cedo (< 60% do limite), corta à bruta — é melhor
 * do que devolver duas palavras de um título de sete.
 */
export function clamp(texto: string, max: number): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= max) return limpo;
  const corte = limpo.slice(0, max - 1);
  const ultimoEspaco = corte.lastIndexOf(" ");
  const base = ultimoEspaco > max * 0.6 ? corte.slice(0, ultimoEspaco) : corte;
  // sem pontuação antes da elipse: ".…" e ",…" leem-se como erro de escrita
  return `${base.replace(/[\s.,;:—–-]+$/u, "")}…`;
}

/** Título de página, dimensionado para caber com o sufixo da marca. */
export function seoTitulo(texto: string): string {
  return clamp(texto, MAX_TITULO_PAGINA);
}

export function seoDescricao(texto: string): string {
  return clamp(texto, LIMITES.description);
}

/**
 * Bloco `openGraph` completo para uma rota.
 *
 * O merge de metadata do Next é *shallow*: uma página que declare `openGraph`
 * substitui o objeto inteiro do layout raiz, perdendo `siteName` e `locale`.
 * Por isso este helper devolve sempre o bloco todo — e por isso nenhuma
 * página deve escrever `openGraph` à mão.
 *
 * `imagens` omitido deixa o `app/opengraph-image.tsx` da raiz assumir.
 */
export function openGraphRota({
  caminho,
  titulo,
  descricao,
  imagens,
}: {
  caminho: string;
  titulo: string;
  descricao: string;
  imagens?: NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;
}): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "pt_PT",
    siteName: SITE_NAME,
    url: caminho,
    title: titulo,
    description: descricao,
    ...(imagens ? { images: imagens } : {}),
  };
}
