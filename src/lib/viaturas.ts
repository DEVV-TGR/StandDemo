import "server-only";
import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { db, temDadosBase } from "@/db";
import { viaturas as tabela, type ViaturaRow } from "@/db/schema";
import { viaturas as inventarioEstatico } from "@/data/viaturas";
import type {
  Combustivel,
  EstadoVenda,
  Segmento,
  Transmissao,
  Viatura,
} from "@/lib/types";

/*
  A porta única para o inventário.

  Todo o site lê as viaturas por aqui — nenhuma página e nenhum componente
  importa `@/data/viaturas` directamente. Há uma regra de ESLint a garanti-lo
  (`no-restricted-imports` em `eslint.config.mjs`), porque uma convenção que
  só existe na cabeça de quem a escreveu dura até ao PR seguinte.

  ## As duas fontes, e quando cada uma vale

  Com credenciais, lê do Neon. Sem elas, ou quando a base não responde, serve
  o ficheiro estático de `src/data/viaturas.ts`.

  **É este recuo que evita repetir o revert do PR #12.** Lá, a camada de
  leitura passou a exigir a base e as páginas passaram a dinâmicas: o build
  compilava — a ligação é preguiçosa — mas o primeiro pedido rebentava. Sem
  Neon configurado o site não funcionava, e quem clonasse o repositório não
  conseguia arrancar.

  ## Duas maneiras de não haver base, e as duas contam

  A primeira é óbvia: não há `DATABASE_URL`. É o caso de quem clona o
  repositório, e é como o CI corre o build.

  A segunda passa despercebida e é a que morde em produção: **a variável está
  definida mas a base não responde**. Na Vercel ela está sempre lá; se o Neon
  esgotar as CU-hours do mês, se estiver a acordar mais devagar do que o
  habitual, ou se a rede falhar, a consulta atira. Sem o `catch`, o site
  público dá 500 — o mesmo resultado do revert, por outro caminho.

  ## Mas o `catch` é só para o site público

  No `/admin` a falha tem de ser visível. Se o painel recuasse para o estático
  em silêncio, o cliente apagava uma viatura, via-a reaparecer, e concluía que
  o painel está avariado. É por isso que estas funções servem o site, e as
  leituras do painel hão-de ir directas à base.

  ## `server-only`

  Se alguém importar este módulo a partir de um componente com `"use client"`,
  o build falha — e agora isso protege as credenciais do Neon, não apenas um
  ficheiro que já era público.
*/

/*
  Uma linha da base no tipo de domínio.

  As colunas de texto livre viram uniões com um cast. O que as garante é o
  `zod` do formulário do painel, à entrada; a base aceita qualquer texto de
  propósito, para uma viatura com um valor inesperado não deixar a tabela num
  estado que o schema recusa.
*/
function linhaParaViatura(row: ViaturaRow): Viatura {
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

/*
  Todas as viaturas, mais recentes primeiro — e o único sítio onde a base é
  consultada. As outras funções derivam desta lista em memória.

  Custa uma consulta em vez de quatro, e com seis viaturas — ou seiscentas —
  filtrar em JavaScript é mais barato do que ir outra vez ao Neon. Quando o
  inventário for grande ao ponto de isto doer, a conversa é outra; hoje não é.

  Memoizado com o `cache` do React: dentro do mesmo render, a página e o
  `ChromeSite` pedem ambos o inventário e a consulta acontece uma vez só. Não
  é cache entre pedidos.
*/
export const getViaturas = cache(async (): Promise<Viatura[]> => {
  if (!temDadosBase()) return inventarioEstatico;

  try {
    const linhas = await db.select().from(tabela).orderBy(desc(tabela.criadoEm));
    return linhas.map(linhaParaViatura);
  } catch (erro) {
    /*
      Vai para o registo de execução da Vercel, e é a única forma de saber que
      isto aconteceu — o visitante não vê diferença nenhuma, que é o ponto.
    */
    console.error("[viaturas] leitura falhou, recurso ao inventário estático:", erro);
    return inventarioEstatico;
  }
});

/** Uma viatura pelo id, ou `null` se não existir. */
export const getViatura = cache(async (id: string): Promise<Viatura | null> => {
  if (!temDadosBase()) {
    return inventarioEstatico.find((v) => v.id === id) ?? null;
  }

  try {
    const [linha] = await db.select().from(tabela).where(eq(tabela.id, id)).limit(1);
    return linha ? linhaParaViatura(linha) : null;
  } catch (erro) {
    console.error("[viaturas] leitura de", id, "falhou, recurso ao estático:", erro);
    return inventarioEstatico.find((v) => v.id === id) ?? null;
  }
});

/** As que aparecem em "Viaturas em Destaque", na homepage. */
export async function getDestaques(): Promise<Viatura[]> {
  return (await getViaturas()).filter((v) => v.destaque);
}

/**
 * Até `limite` outras viaturas, para a secção "Também vai gostar destas".
 *
 * Exclui a que está a ser vista — sugerir a alguém a página onde já está é o
 * tipo de detalhe que ninguém elogia e toda a gente nota.
 */
export async function getSugestoes(
  idExcluir: string,
  limite = 3,
): Promise<Viatura[]> {
  const todas = await getViaturas();
  return todas.filter((v) => v.id !== idExcluir).slice(0, limite);
}
