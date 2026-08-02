import type { Viatura } from "@/lib/types";

export function urlViatura(v: Viatura): string {
  return `/carros/${v.marcaSlug}/${v.modeloSlug}/${v.id}`;
}

export function urlViaturasPorMarca(marcaSlug: string): string {
  return `/viaturas?marca=${marcaSlug}`;
}
