import "server-only";
import { desc } from "drizzle-orm";
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

/**
 * Todas as viaturas, mais recentes primeiro.
 *
 * A ordenação por `criadoEm` é o que faz uma viatura acabada de criar aparecer
 * no topo, onde quem a criou está a olhar. É para isto que a coluna existe.
 */
export async function listarViaturas(): Promise<Viatura[]> {
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
