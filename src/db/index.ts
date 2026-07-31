import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Ligação preguiçosa: só é criada (e só valida DATABASE_URL) quando alguma
// query é executada. Assim o `next build` pode compilar sem a variável definida
// (as páginas de dados são dinâmicas e só tocam na base em runtime).
let instancia: NeonHttpDatabase<typeof schema> | null = null;

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

// Proxy que encaminha para a instância real na primeira utilização.
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_alvo, prop) {
    const real = obterDb();
    const valor = real[prop as keyof typeof real];
    return typeof valor === "function" ? valor.bind(real) : valor;
  },
});

export { schema };
