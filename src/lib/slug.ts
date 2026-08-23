import type { Viatura } from "@/lib/types";

export function urlViatura(v: Viatura): string {
  return `/carros/${v.marcaSlug}/${v.modeloSlug}/${v.id}`;
}

export function urlViaturasPorMarca(marcaSlug: string): string {
  return `/viaturas?marca=${marcaSlug}`;
}

/**
 * Texto livre → slug para URL: "CLA 250" → "cla-250", "Citroën" → "citroen".
 *
 * Usado ao gravar uma viatura no painel. O slug é o que entra no endereço da
 * ficha, por isso é gerado uma vez, à criação, e nunca recalculado: corrigir
 * uma gralha na marca não pode mudar o URL e matar os links já partilhados.
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos combinantes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // não-alfanumérico → hífen
    .replace(/^-+|-+$/g, ""); // apara hífens nas pontas
}
