import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { viaturas as viaturasTable } from "@/db/schema";
import type { ViaturaRow } from "@/db/schema";
import type {
  Combustivel,
  EstadoVenda,
  Segmento,
  Transmissao,
  Viatura,
} from "@/lib/types";

// Converte uma linha da base de dados no tipo de domínio `Viatura`.
// As colunas de texto livres (segmento/combustível/…) são afinadas para as
// uniões do tipo — os valores são garantidos pelo formulário de admin (zod).
export function rowToViatura(row: ViaturaRow): Viatura {
  return {
    id: row.id,
    marca: row.marca,
    marcaSlug: row.marcaSlug,
    modelo: row.modelo,
    modeloSlug: row.modeloSlug,
    versao: row.versao,
    preco: row.preco,
    registoMes: row.registoMes,
    registoAno: row.registoAno,
    quilometros: row.quilometros,
    lugares: row.lugares,
    portas: row.portas,
    segmento: row.segmento as Segmento,
    combustivel: row.combustivel as Combustivel,
    potenciaCv: row.potenciaCv,
    cilindradaCc: row.cilindradaCc,
    transmissao: row.transmissao as Transmissao,
    cor: row.cor,
    corInterior: row.corInterior,
    origem: row.origem,
    estado: row.estado,
    garantia: row.garantia,
    livroRevisoes: row.livroRevisoes,
    segundaChave: row.segundaChave,
    classePortagem: row.classePortagem,
    matricula: row.matricula,
    vin: row.vin,
    fotos: row.fotos,
    extras: row.extras,
    destaque: row.destaque,
    estadoVenda: row.estadoVenda as EstadoVenda,
    ivaDedutivel: row.ivaDedutivel,
    descricao: row.descricao,
  };
}

/** Todas as viaturas, mais recentes primeiro. */
export async function getViaturas(): Promise<Viatura[]> {
  const linhas = await db
    .select()
    .from(viaturasTable)
    .orderBy(desc(viaturasTable.criadoEm));
  return linhas.map(rowToViatura);
}

/** Uma viatura pelo id (ou null). */
export async function getViatura(id: string): Promise<Viatura | null> {
  const [linha] = await db
    .select()
    .from(viaturasTable)
    .where(eq(viaturasTable.id, id))
    .limit(1);
  return linha ? rowToViatura(linha) : null;
}

/** Viaturas em destaque, mais recentes primeiro. */
export async function getDestaques(): Promise<Viatura[]> {
  const linhas = await db
    .select()
    .from(viaturasTable)
    .where(eq(viaturasTable.destaque, true))
    .orderBy(desc(viaturasTable.criadoEm));
  return linhas.map(rowToViatura);
}

/** Até `limite` outras viaturas, para a secção "Também vai gostar destas". */
export async function getSugestoes(
  idExcluir: string,
  limite = 3,
): Promise<Viatura[]> {
  const linhas = await db
    .select()
    .from(viaturasTable)
    .orderBy(desc(viaturasTable.criadoEm));
  return linhas
    .filter((l) => l.id !== idExcluir)
    .slice(0, limite)
    .map(rowToViatura);
}
