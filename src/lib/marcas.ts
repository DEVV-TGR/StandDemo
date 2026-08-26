/** Logótipos brancos monocromáticos por marca (public/logo/marcas). */
const LOGOS: Record<string, string> = {
  bmw: "/logo/marcas/bmw.svg",
  mini: "/logo/marcas/mini.svg",
  porsche: "/logo/marcas/porsche.svg",
  jaguar: "/logo/marcas/jaguar.webp",
  "mercedes-benz": "/logo/marcas/mercedes-benz.webp",
  renault: "/logo/marcas/renault.svg",
};

/** Caminho do logótipo da marca, ou null se não houver (fallback ao nome). */
export function logoMarca(slug: string): string | null {
  return LOGOS[slug] ?? null;
}
