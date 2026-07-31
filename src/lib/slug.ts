import type { Viatura } from "@/lib/types";

export function urlViatura(v: Viatura): string {
  return `/carros/${v.marcaSlug}/${v.modeloSlug}/${v.id}`;
}

export function urlViaturasPorMarca(marcaSlug: string): string {
  return `/viaturas?marca=${marcaSlug}`;
}

/** Converte texto livre num slug URL-safe (ex.: "CLA 250" → "cla-250"). */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos combinantes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // não-alfanumérico → hífen
    .replace(/^-+|-+$/g, ""); // apara hífens nas pontas
}
