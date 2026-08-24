"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { viaturas as tabela } from "@/db/schema";
import { exigirSessaoNaAccao } from "@/lib/painel/porta";

/*
  As acções que gravam.

  **`exigirSessaoNaAccao()` na primeira linha de cada uma, sem excepção.** Uma
  server action é um endpoint HTTP real: pode ser chamada por um POST feito à
  mão, sem browser e sem passar pela página que a mostra. O gate do proxy e o
  `exigirSessao()` da página não a protegem — só protegem quem lá chega pelo
  caminho normal.
*/

/*
  O site é estático: as páginas foram geradas no build e não voltam a consultar
  a base sozinhas. Sem este aviso, o cliente gravava, ia ver o site, e não via
  nada mudar — e é o pior tipo de avaria, porque parece que o painel não
  funciona quando o que falta é dizer ao site que os dados mudaram.

  **O `(site)` no caminho das fichas não é decoração.** Um caminho literal
  resolve-se pelo URL, e por isso `/` e `/viaturas` funcionam como estão. Mas
  um padrão com segmento dinâmico resolve-se pelo **ficheiro**, e o ficheiro
  está dentro do grupo de rotas — a documentação do Next dá exactamente este
  exemplo (`revalidatePath('/(main)/blog/[slug]', 'page')`).

  Sem o grupo, o padrão não corresponde a nada e falha em silêncio: apagava-se
  uma viatura, o catálogo actualizava, e a ficha dela continuava a responder
  200 com os dados antigos. Um link partilhado no WhatsApp mostrava uma viatura
  que já não existe.
*/
function revalidarSite(): void {
  revalidatePath("/");
  revalidatePath("/viaturas");
  revalidatePath("/(site)/carros/[marca]/[modelo]/[id]", "page");
}

export type ResultadoDeApagar = { erro?: string };

/**
 * Apaga uma viatura.
 *
 * Não há desfazer nem lixo de recuperação — por isso a confirmação, do lado do
 * ecrã, nomeia o que se vai perder em vez de perguntar "tem a certeza?".
 */
export async function apagarViatura(id: string): Promise<ResultadoDeApagar> {
  await exigirSessaoNaAccao();

  try {
    const apagadas = await db
      .delete(tabela)
      .where(eq(tabela.id, id))
      .returning({ id: tabela.id });

    if (apagadas.length === 0) {
      return { erro: "Essa viatura já não existe. Actualize a página." };
    }
  } catch (erro) {
    console.error("[painel] falha ao apagar", id, erro);
    return { erro: "Não foi possível apagar. Tente daqui a pouco." };
  }

  /*
    As fotografias que estiverem no R2 ficam por apagar até o upload existir —
    hoje as fotos das viaturas são ficheiros em `public/`, do repositório, e
    não há nada no bucket para remover. Fica anotado para o PR das fotos, que é
    onde o `apagarFoto` entra.
  */

  revalidarSite();
  return {};
}
