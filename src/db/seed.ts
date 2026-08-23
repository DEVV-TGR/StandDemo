import { neon } from "@neondatabase/serverless";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { loadEnv } from "./load-env";
import { viaturas as viaturasTable } from "./schema";
import { viaturas as inventarioEstatico } from "@/data/viaturas";

/*
  Põe na base as viaturas que hoje vivem em `src/data/viaturas.ts`.

  É idempotente: correr duas vezes não duplica nada. Os ids mantêm-se, e uma
  segunda passagem actualiza os campos que mudam com frequência em vez de
  inserir de novo — o que permite semear a base outra vez depois de mexer no
  ficheiro estático, sem perder o resto.

  **Não cria utilizador nenhum.** O `#12` criava um `admin_users` com uma
  palavra-passe por omissão (`admin1234`, com um aviso a dizer para a mudar).
  Isso desapareceu com o acesso passwordless: quem entra é quem estiver em
  `PAINEL_EMAILS`, e não há nada para semear.
*/

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL em falta em .env.local (ver .env.example).");
}

async function main() {
  const db = drizzle(neon(databaseUrl!));

  console.log(`A semear ${inventarioEstatico.length} viaturas…`);

  for (const v of inventarioEstatico) {
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
      /*
        Só os campos que mudam sozinhos. Marca, modelo e os slugs ficam de
        fora de propósito: o slug entra no endereço da ficha, e recalculá-lo
        num seed mataria os links já partilhados. É a mesma regra que a acção
        de editar vai seguir.
      */
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

  const [{ total }] = await db
    .select({ total: count() })
    .from(viaturasTable);
  console.log(`Feito. A base tem ${total} viaturas.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  });
