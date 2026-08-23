import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/*
  A ligação à base.

  **Preguiçosa**: só é criada, e só valida a `DATABASE_URL`, quando alguma
  consulta é executada. É o que permite ao `next build` compilar sem variável
  nenhuma definida — que é como o CI o corre, de propósito.
*/

/**
 * Há credenciais configuradas?
 *
 * Existe para o site público poder servir o inventário estático quando não há
 * base — e é a fonte única dessa resposta, para não haver duas versões dela em
 * `viaturas.ts` e em `r2.ts`.
 *
 * **Isto não diz que a base responde**, apenas que a variável existe. Na
 * Vercel ela está sempre definida; se o Neon estiver a dormir ou a rede falhar,
 * a consulta rebenta na mesma. Quem lê pelo caminho público tem de apanhar o
 * erro e recuar para o estático — ver `src/lib/viaturas.ts`.
 */
export function temDadosBase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let instancia: NeonHttpDatabase<typeof schema> | null = null;

/*
  O `throw` é deliberado, e sobreviveu à revisão que se seguiu ao revert do
  PR #12.

  A tentação era removê-lo, porque foi a mensagem que apareceu quando o site
  rebentou. Mas o erro não estava aqui: estava em o site público conseguir
  chegar a esta função sem credenciais. Para o seed, para as migrações e para o
  painel, "falta a DATABASE_URL" é exactamente o que se quer ouvir — muito
  melhor do que um `undefined` a propagar-se três camadas acima.

  Quem tem de recuar em silêncio é o caminho de leitura público, e faz-o com o
  `temDadosBase()` acima.
*/
function obterDb(): NeonHttpDatabase<typeof schema> {
  if (!instancia) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL em falta. Defina a connection string do Neon em .env.local (ver .env.example).",
      );
    }
    instancia = drizzle(neon(databaseUrl), { schema });
  }
  return instancia;
}

/** Encaminha para a instância real na primeira utilização. */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_alvo, prop) {
    const real = obterDb();
    const valor = real[prop as keyof typeof real];
    return typeof valor === "function" ? valor.bind(real) : valor;
  },
});

export { schema };
