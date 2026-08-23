import type {
  Combustivel,
  Segmento,
  Transmissao,
  Viatura,
} from "@/lib/types";

/*
  Tudo o que se deriva do inventário: as marcas da grelha, os modelos do
  filtro, os intervalos dos sliders, os destaques da homepage.

  **Funções puras.** Recebem a lista por argumento em vez de a importarem.
  Antes liam `@/data/viaturas` directamente na primeira linha, o que amarrava
  toda a homepage e todo o catálogo ao ficheiro estático — e tornava
  impossível servir os mesmos ecrãs a partir da base de dados sem lhes tocar.

  Quem lê o inventário é `src/lib/viaturas.ts`, e só ele.
*/

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

/*
  Sem esta guarda, `Math.min(...[])` devolve `Infinity` e os sliders do painel
  de filtros nascem com limites impossíveis. Hoje o stock nunca está vazio
  porque vem de um ficheiro com seis viaturas; a partir do momento em que vier
  da base, uma tabela ainda por semear é o primeiro estado que acontece.
*/
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

/**
 * Viaturas ainda à venda. Uma 404 ou um ecrã de erro recebem sobretudo quem
 * vinha ver um carro; mostrar-lhe stock vendido seria repetir a desilusão.
 */
export function getDisponiveis(lista: Viatura[], limite?: number): Viatura[] {
  const disponiveis = lista.filter((v) => v.estadoVenda !== "vendido");
  return limite ? disponiveis.slice(0, limite) : disponiveis;
}
