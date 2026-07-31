import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { loadEnv } from "./load-env";
import { adminUsers, viaturas as viaturasTable } from "./schema";
import { viaturas as viaturasSeed } from "@/data/viaturas";

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL em falta em .env.local (ver .env.example).");
}

const emailAdmin = process.env.SEED_ADMIN_EMAIL ?? "admin@imperioautoconcept.pt";
const passwordAdmin = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

async function main() {
  const sql = neon(databaseUrl!);
  const db = drizzle(sql);

  // Viaturas — mantém os ids existentes; re-correr o seed atualiza os dados.
  console.log(`A inserir ${viaturasSeed.length} viaturas...`);
  for (const v of viaturasSeed) {
    await db
      .insert(viaturasTable)
      .values({
        id: v.id,
        marca: v.marca,
        marcaSlug: v.marcaSlug,
        modelo: v.modelo,
        modeloSlug: v.modeloSlug,
        versao: v.versao,
        preco: v.preco,
        registoMes: v.registoMes,
        registoAno: v.registoAno,
        quilometros: v.quilometros,
        lugares: v.lugares,
        portas: v.portas,
        segmento: v.segmento,
        combustivel: v.combustivel,
        potenciaCv: v.potenciaCv,
        cilindradaCc: v.cilindradaCc,
        transmissao: v.transmissao,
        cor: v.cor,
        corInterior: v.corInterior,
        origem: v.origem,
        estado: v.estado,
        garantia: v.garantia,
        livroRevisoes: v.livroRevisoes,
        segundaChave: v.segundaChave,
        classePortagem: v.classePortagem,
        matricula: v.matricula,
        vin: v.vin,
        fotos: v.fotos,
        extras: v.extras,
        destaque: v.destaque,
        estadoVenda: v.estadoVenda,
        ivaDedutivel: v.ivaDedutivel,
        descricao: v.descricao,
      })
      .onConflictDoUpdate({
        target: viaturasTable.id,
        set: {
          preco: v.preco,
          fotos: v.fotos,
          extras: v.extras,
          estadoVenda: v.estadoVenda,
          descricao: v.descricao,
          atualizadoEm: new Date(),
        },
      });
  }

  // Admin inicial — não sobrescreve a palavra-passe se já existir.
  const passwordHash = await bcrypt.hash(passwordAdmin, 10);
  await db
    .insert(adminUsers)
    .values({
      id: randomUUID(),
      email: emailAdmin.toLowerCase(),
      passwordHash,
      nome: "Administrador",
    })
    .onConflictDoNothing({ target: adminUsers.email });

  console.log("\nSeed concluído.");
  console.log(`Admin: ${emailAdmin}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      "Palavra-passe (predefinida): admin1234 — altere via SEED_ADMIN_PASSWORD e volte a correr, ou mude na base de dados.",
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  });
