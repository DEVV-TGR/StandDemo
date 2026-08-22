import type { Combustivel, Segmento, Transmissao, Viatura } from "@/lib/types";

export type Ordenacao =
  | "relevancia"
  | "preco-asc"
  | "preco-desc"
  | "ano-desc"
  | "ano-asc"
  | "km-asc";

export interface Filtros {
  marca?: string;
  modelo?: string;
  combustivel?: Combustivel;
  transmissao?: Transmissao;
  segmento?: Segmento;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  anoMax?: number;
  kmMin?: number;
  kmMax?: number;
  ordenar?: Ordenacao;
}

export const ORDENACOES: { valor: Ordenacao; rotulo: string }[] = [
  { valor: "relevancia", rotulo: "Relevância" },
  { valor: "preco-asc", rotulo: "Preço: mais baixo" },
  { valor: "preco-desc", rotulo: "Preço: mais alto" },
  { valor: "ano-desc", rotulo: "Ano: mais recente" },
  { valor: "ano-asc", rotulo: "Ano: mais antigo" },
  { valor: "km-asc", rotulo: "Quilómetros: menos" },
];

type SearchParams = Record<string, string | string[] | undefined>;

/*
  Os valores que cada filtro pode tomar, para nada do URL entrar sem passar por
  aqui. O `ordenar` já era validado; o resto era convertido à confiança.

  Sem isto, um valor cru do URL chega aos chips do catálogo — `nomePorSlug()`
  devolve o próprio slug quando não conhece a marca — e um endereço partilhado
  consegue pôr texto à escolha de quem o partilha dentro da interface do site.
  Não é injecção de código, que o React escapa tudo; é o site parecer estar a
  dizer uma coisa que não é dele.
*/
const COMBUSTIVEIS: readonly Combustivel[] = ["Gasolina", "Diesel", "Híbrido", "Elétrico"];
const TRANSMISSOES: readonly Transmissao[] = ["Automática", "Manual"];
const SEGMENTOS: readonly Segmento[] = ["Coupé", "SUV", "Carrinha", "Berlina", "Cabrio", "Citadino"];

function umDe<T extends string>(
  v: string | string[] | undefined,
  validos: readonly T[],
): T | undefined {
  const s = umValor(v);
  return validos.includes(s as T) ? (s as T) : undefined;
}

/*
  Marca e modelo não têm lista fixa — nascem dos dados, e passarão a nascer da
  base. Valida-se a forma: um slug é minúsculas, dígitos e hífens, e mais nada.
  Chega para fechar a porta sem acoplar este ficheiro ao inventário.
*/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function umSlug(v: string | string[] | undefined): string | undefined {
  const s = umValor(v);
  return s !== undefined && s.length <= 60 && SLUG.test(s) ? s : undefined;
}

function umValor(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function umNumero(v: string | string[] | undefined): number | undefined {
  const s = umValor(v);
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFiltros(sp: SearchParams): Filtros {
  const ordenar = umValor(sp.ordenar);
  return {
    marca: umSlug(sp.marca),
    modelo: umSlug(sp.modelo),
    combustivel: umDe(sp.combustivel, COMBUSTIVEIS),
    transmissao: umDe(sp.transmissao, TRANSMISSOES),
    segmento: umDe(sp.segmento, SEGMENTOS),
    precoMin: umNumero(sp.precoMin),
    precoMax: umNumero(sp.precoMax),
    anoMin: umNumero(sp.anoMin),
    anoMax: umNumero(sp.anoMax),
    kmMin: umNumero(sp.kmMin),
    kmMax: umNumero(sp.kmMax),
    ordenar: ORDENACOES.some((o) => o.valor === ordenar)
      ? (ordenar as Ordenacao)
      : undefined,
  };
}

export function serializeFiltros(filtros: Filtros): string {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === "" || valor === "relevancia") continue;
    params.set(chave, String(valor));
  }
  return params.toString();
}

export function filtrarViaturas(lista: Viatura[], filtros: Filtros): Viatura[] {
  return lista.filter((v) => {
    if (filtros.marca && v.marcaSlug !== filtros.marca) return false;
    if (filtros.modelo && v.modeloSlug !== filtros.modelo) return false;
    if (filtros.combustivel && v.combustivel !== filtros.combustivel) return false;
    if (filtros.transmissao && v.transmissao !== filtros.transmissao) return false;
    if (filtros.segmento && v.segmento !== filtros.segmento) return false;
    if (filtros.precoMin !== undefined && v.preco < filtros.precoMin) return false;
    if (filtros.precoMax !== undefined && v.preco > filtros.precoMax) return false;
    if (filtros.anoMin !== undefined && v.registoAno < filtros.anoMin) return false;
    if (filtros.anoMax !== undefined && v.registoAno > filtros.anoMax) return false;
    if (filtros.kmMin !== undefined && v.quilometros < filtros.kmMin) return false;
    if (filtros.kmMax !== undefined && v.quilometros > filtros.kmMax) return false;
    return true;
  });
}

export function ordenarViaturas(
  lista: Viatura[],
  ordenar: Ordenacao = "relevancia",
): Viatura[] {
  const copia = [...lista];
  switch (ordenar) {
    case "preco-asc":
      return copia.sort((a, b) => a.preco - b.preco);
    case "preco-desc":
      return copia.sort((a, b) => b.preco - a.preco);
    case "ano-desc":
      return copia.sort(
        (a, b) =>
          b.registoAno - a.registoAno || b.registoMes - a.registoMes,
      );
    case "ano-asc":
      return copia.sort(
        (a, b) =>
          a.registoAno - b.registoAno || a.registoMes - b.registoMes,
      );
    case "km-asc":
      return copia.sort((a, b) => a.quilometros - b.quilometros);
    case "relevancia":
    default:
      // destaques primeiro, disponíveis antes de reservados/vendidos
      return copia.sort((a, b) => {
        const pesoEstado = (v: Viatura) =>
          v.estadoVenda === "disponivel" ? 0 : v.estadoVenda === "reservado" ? 1 : 2;
        return (
          pesoEstado(a) - pesoEstado(b) ||
          Number(b.destaque) - Number(a.destaque) ||
          a.preco - b.preco
        );
      });
  }
}
