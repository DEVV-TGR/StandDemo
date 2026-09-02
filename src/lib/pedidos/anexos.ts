import "server-only";
import type { Anexo } from "@/lib/email";
import {
  ErroDeFotos,
  EXTENSOES,
  FOTOS_MAXIMAS,
  TOTAL_MAXIMO,
} from "@/lib/pedidos/fotos";

/*
  As fotografias de um pedido, postas em base64 para seguirem em anexo.

  **Nada fica guardado.** O ficheiro entra no pedido, sai no email, e acaba
  aí. É o que a Política de Privacidade diz, e é o que permite dizê-lo.

  Os limites são os mesmos que o formulário mostra, e são revalidados aqui
  porque uma server action pode ser chamada sem passar por formulário nenhum.
*/

/*
  Um `<input type="file">` sem nada escolhido submete na mesma — um `File`
  vazio, sem nome. Não é uma fotografia; ignora-se.
*/
function reais(entradas: FormDataEntryValue[]): File[] {
  return entradas.filter((f): f is File => f instanceof File && f.size > 0);
}

export async function prepararAnexos(entradas: FormDataEntryValue[]): Promise<Anexo[]> {
  const ficheiros = reais(entradas);

  if (ficheiros.length > FOTOS_MAXIMAS) {
    throw new ErroDeFotos(`No máximo ${FOTOS_MAXIMAS} fotografias.`);
  }

  const total = ficheiros.reduce((soma, f) => soma + f.size, 0);
  if (total > TOTAL_MAXIMO) {
    throw new ErroDeFotos(
      "As fotografias são demasiado pesadas no conjunto. Tire uma ou duas e tente de novo.",
    );
  }

  return Promise.all(
    ficheiros.map(async (f, i) => {
      const extensao = EXTENSOES[f.type];
      if (!extensao) {
        throw new ErroDeFotos("Só aceitamos fotografias em JPEG, PNG, WebP ou AVIF.");
      }
      return {
        nome: `foto-${i + 1}.${extensao}`,
        tipo: f.type,
        conteudo: Buffer.from(await f.arrayBuffer()).toString("base64"),
      };
    }),
  );
}
