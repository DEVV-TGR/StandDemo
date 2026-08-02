import { viaturas } from "@/data/viaturas";
import type { Combustivel, Segmento, Transmissao } from "@/lib/types";

export interface Marca {
  nome: string;
  slug: string;
}

export interface ModeloOpcao {
  nome: string;
  slug: string;
  marcaSlug: string;
}

export function getMarcas(): Marca[] {
  const mapa = new Map<string, Marca>();
  for (const v of viaturas) {
    mapa.set(v.marcaSlug, { nome: v.marca, slug: v.marcaSlug });
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}

export function getModelos(marcaSlug?: string): ModeloOpcao[] {
  const mapa = new Map<string, ModeloOpcao>();
  for (const v of viaturas) {
    if (marcaSlug && v.marcaSlug !== marcaSlug) continue;
    mapa.set(v.modeloSlug, {
      nome: v.modelo,
      slug: v.modeloSlug,
      marcaSlug: v.marcaSlug,
    });
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}

export function getCombustiveis(): Combustivel[] {
  return [...new Set(viaturas.map((v) => v.combustivel))].sort((a, b) =>
    a.localeCompare(b, "pt"),
  );
}

export function getTransmissoes(): Transmissao[] {
  return [...new Set(viaturas.map((v) => v.transmissao))].sort((a, b) =>
    a.localeCompare(b, "pt"),
  );
}

export function getSegmentos(): Segmento[] {
  return [...new Set(viaturas.map((v) => v.segmento))].sort((a, b) =>
    a.localeCompare(b, "pt"),
  );
}

export interface Intervalos {
  preco: [number, number];
  ano: [number, number];
  km: [number, number];
}

function arredondarIntervalo(
  valores: number[],
  passo: number,
): [number, number] {
  const min = Math.floor(Math.min(...valores) / passo) * passo;
  const max = Math.ceil(Math.max(...valores) / passo) * passo;
  return [min, max];
}

export function getIntervalos(): Intervalos {
  return {
    preco: arredondarIntervalo(viaturas.map((v) => v.preco), 1000),
    ano: [
      Math.min(...viaturas.map((v) => v.registoAno)),
      Math.max(...viaturas.map((v) => v.registoAno)),
    ],
    km: arredondarIntervalo(viaturas.map((v) => v.quilometros), 5000),
  };
}

export function getDestaques() {
  return viaturas.filter((v) => v.destaque);
}
