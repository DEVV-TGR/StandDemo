import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, temDadosBase } from "@/db";
import { viaturas as tabela } from "@/db/schema";
import type { Viatura } from "@/lib/types";

/*
  A leitura do painel — e é de propósito que não é a mesma do site.

  O `src/lib/viaturas.ts` recua para o inventário estático quando a base não
  responde, porque um visitante não tem culpa nem forma de perceber. **Aqui
  isso seria mentir a quem está a trabalhar.** Se o cliente apagasse uma
  viatura e a visse reaparecer, concluía que o painel está avariado — e teria
  razão, mas pela razão errada.

  Por isso este ficheiro deixa o erro subir. O `error.tsx` do painel apanha-o e
  diz o que se passa; o que não pode acontecer é o painel mostrar dados que não
  são os da base e fingir que está tudo bem.
*/

/** Sinaliza que não há base configurada — o painel mostra instruções, não um erro. */
export class SemBaseDeDados extends Error {
  constructor() {
    super("Não há base de dados configurada.");
    this.name = "SemBaseDeDados";
  }
}

/*
  A viatura como o painel a vê: com as datas.

  O `Viatura` que o site usa não as tem, e não é distracção — o inventário
  estático de `src/data/viaturas.ts` também é um `Viatura[]`, e datas de
  publicação num ficheiro escrito à mão seriam datas inventadas. Quem tem
  datas a sério é quem vem da base, e é só o painel.
*/
export type ViaturaPainel = Viatura & {
  /** Quando o anúncio foi publicado. */
  criadoEm: Date;
  /** Última vez que foi editado. */
  atualizadoEm: Date;
};

/**
 * Todas as viaturas, mais recentes primeiro.
 *
 * A ordenação por `criadoEm` é o que faz uma viatura acabada de criar aparecer
 * no topo, onde quem a criou está a olhar. É para isto que a coluna existe.
 */
export async function listarViaturas(): Promise<ViaturaPainel[]> {
  if (!temDadosBase()) throw new SemBaseDeDados();

  const linhas = await db.select().from(tabela).orderBy(desc(tabela.criadoEm));

  return linhas.map((row) => ({
    ...row,
    segmento: row.segmento as Viatura["segmento"],
    combustivel: row.combustivel as Viatura["combustivel"],
    transmissao: row.transmissao as Viatura["transmissao"],
    estadoVenda: row.estadoVenda as Viatura["estadoVenda"],
  }));
}

/** Uma viatura pelo id, para o formulário de edição. */
export async function obterViatura(id: string): Promise<Viatura | null> {
  if (!temDadosBase()) throw new SemBaseDeDados();

  const [row] = await db.select().from(tabela).where(eq(tabela.id, id)).limit(1);
  if (!row) return null;

  return {
    ...row,
    segmento: row.segmento as Viatura["segmento"],
    combustivel: row.combustivel as Viatura["combustivel"],
    transmissao: row.transmissao as Viatura["transmissao"],
    estadoVenda: row.estadoVenda as Viatura["estadoVenda"],
  };
}

/*
  As marcas e modelos já usados, para as sugestões do formulário.

  São `DISTINCT` na base e não uma leitura de tudo em memória: é a única
  consulta do painel que pode crescer com o inventário, e ordenada dá uma lista
  que se percorre com os olhos.
*/
export async function opcoesConhecidas(): Promise<{
  marcas: string[];
  modelos: string[];
}> {
  if (!temDadosBase()) return { marcas: [], modelos: [] };

  const [m, mo] = await Promise.all([
    db.selectDistinct({ v: tabela.marca }).from(tabela).orderBy(tabela.marca),
    db.selectDistinct({ v: tabela.modelo }).from(tabela).orderBy(tabela.modelo),
  ]);

  return { marcas: m.map((x) => x.v), modelos: mo.map((x) => x.v) };
}
