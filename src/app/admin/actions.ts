"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { viaturas as viaturasTable } from "@/db/schema";
import { apagarFoto, uploadFoto } from "@/lib/r2";
import { slugify } from "@/lib/slug";
import { viaturaSchema, type ViaturaInput } from "@/lib/viatura-schema";

// Todas as operações verificam a sessão (defesa em profundidade — não confiar
// apenas na proteção do layout/proxy, conforme recomendado na doc do Next 16).
async function exigirSessao() {
  const sessao = await auth();
  if (!sessao) redirect("/admin/login");
}

function gerarId(): string {
  return `v-${randomUUID().slice(0, 8)}`;
}

// Como as páginas do site são dinâmicas, revalidar é sobretudo defensivo
// (garante frescura caso passem a ISR no futuro).
function revalidarSite() {
  revalidatePath("/");
  revalidatePath("/viaturas");
  revalidatePath("/admin");
}

export async function criarViatura(dados: ViaturaInput): Promise<void> {
  await exigirSessao();
  const v = viaturaSchema.parse(dados);
  const id = gerarId();

  await db.insert(viaturasTable).values({
    id,
    ...v,
    marcaSlug: slugify(v.marca),
    modeloSlug: slugify(v.modelo),
  });

  revalidarSite();
  redirect("/admin");
}

export async function atualizarViatura(
  id: string,
  dados: ViaturaInput,
): Promise<void> {
  await exigirSessao();
  const v = viaturaSchema.parse(dados);

  await db
    .update(viaturasTable)
    .set({
      ...v,
      marcaSlug: slugify(v.marca),
      modeloSlug: slugify(v.modelo),
      atualizadoEm: new Date(),
    })
    .where(eq(viaturasTable.id, id));

  revalidarSite();
  redirect("/admin");
}

export async function apagarViatura(id: string): Promise<void> {
  await exigirSessao();

  const [linha] = await db
    .select({ fotos: viaturasTable.fotos })
    .from(viaturasTable)
    .where(eq(viaturasTable.id, id))
    .limit(1);

  await db.delete(viaturasTable).where(eq(viaturasTable.id, id));

  // Apaga as fotos associadas do R2 (ignora caminhos locais/externos).
  if (linha?.fotos?.length) {
    await Promise.all(linha.fotos.map(apagarFoto));
  }

  revalidarSite();
}

/** Recebe ficheiros do formulário, envia para o R2 e devolve os URLs públicos. */
export async function uploadFotos(formData: FormData): Promise<string[]> {
  await exigirSessao();
  const ficheiros = formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  return Promise.all(ficheiros.map(uploadFoto));
}
