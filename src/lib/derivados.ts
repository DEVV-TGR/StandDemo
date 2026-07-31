import type {
  Combustivel,
  Segmento,
  Transmissao,
  Viatura,
} from "@/lib/types";

// Funções puras: derivam opções/intervalos de uma lista de viaturas passada
// como argumento (a lista vem da base de dados, obtida no servidor).

export interface Marca {
  nome: string;
  slug: string;
}

export interface ModeloOpcao {
  nome: string;
  slug: string;
  marcaSlug: string;
}

export function getMarcas(lista: Viatura[]): Marca[] {
  const mapa = new Map<string, Marca>();
  for (const v of lista) {
    mapa.set(v.marcaSlug, { nome: v.marca, slug: v.marcaSlug });
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}

export function getModelos(
  lista: Viatura[],
  marcaSlug?: string,
): ModeloOpcao[] {
  const mapa = new Map<string, ModeloOpcao>();
  for (const v of lista) {
    if (marcaSlug && v.marcaSlug !== marcaSlug) continue;
    mapa.set(v.modeloSlug, {
      nome: v.modelo,
      slug: v.modeloSlug,
      marcaSlug: v.marcaSlug,
    });
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}

export function getCombustiveis(lista: Viatura[]): Combustivel[] {
  return [...new Set(lista.map((v) => v.combustivel))].sort((a, b) =>
    a.localeCompare(b, "pt"),
  );
}

export function getTransmissoes(lista: Viatura[]): Transmissao[] {
  return [...new Set(lista.map((v) => v.transmissao))].sort((a, b) =>
    a.localeCompare(b, "pt"),
  );
}

export function getSegmentos(lista: Viatura[]): Segmento[] {
  return [...new Set(lista.map((v) => v.segmento))].sort((a, b) =>
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

// Intervalos por defeito quando o stock está vazio (evita Math.min de [] = Infinity).
const INTERVALOS_VAZIO: Intervalos = {
  preco: [0, 100000],
  ano: [2000, 2026],
  km: [0, 300000],
};

export function getIntervalos(lista: Viatura[]): Intervalos {
  if (lista.length === 0) return INTERVALOS_VAZIO;
  return {
    preco: arredondarIntervalo(
      lista.map((v) => v.preco),
      1000,
    ),
    ano: [
      Math.min(...lista.map((v) => v.registoAno)),
      Math.max(...lista.map((v) => v.registoAno)),
    ],
    km: arredondarIntervalo(
      lista.map((v) => v.quilometros),
      5000,
    ),
  };
}

export function getDestaques(lista: Viatura[]): Viatura[] {
  return lista.filter((v) => v.destaque);
}
