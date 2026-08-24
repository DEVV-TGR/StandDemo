"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { viaturas as tabela } from "@/db/schema";
import { exigirSessaoNaAccao } from "@/lib/painel/porta";
import { slugify } from "@/lib/slug";
import { viaturaSchema, type ViaturaInput } from "@/lib/viatura-schema";
import {
  guardarFoto,
  apagarFoto,
  ErroDeFoto,
  FOTOS_MAXIMAS,
} from "@/lib/painel/r2";

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
      .returning({ id: tabela.id, fotos: tabela.fotos });

    if (apagadas.length === 0) {
      return { erro: "Essa viatura já não existe. Actualize a página." };
    }

    /*
      As fotos vão atrás, e **depois** de a viatura sair da base.

      Por esta ordem, uma falha a apagar do bucket deixa ficheiros órfãos — que
      não incomodam ninguém e custam cêntimos. Pela ordem inversa, uma falha ao
      apagar a linha deixava uma viatura no site com as fotos em falta, que é
      muito pior. O `apagarFoto` ignora os URLs que não são do R2, portanto as
      viaturas semeadas com fotos do repositório passam ao lado.
    */
    await Promise.all((apagadas[0].fotos ?? []).map(apagarFoto));
  } catch (erro) {
    console.error("[painel] falha ao apagar", id, erro);
    return { erro: "Não foi possível apagar. Tente daqui a pouco." };
  }

  revalidarSite();
  return {};
}


/*
  Criar e editar.

  A validação corre **aqui**, no servidor, e não só no formulário: uma server
  action é um endpoint HTTP real e pode ser chamada com um corpo qualquer. A
  do cliente é conveniência — evita uma ida ao servidor para dizer o óbvio —
  mas não é fronteira.

  O `parse` é também o que preenche os campos com valor por omissão, o que
  permite ao formulário não os enviar. Ver a nota sobre `z.input` e `z.output`
  em `src/lib/viatura-schema.ts`.
*/

export type ResultadoDeGravar = { erro?: string };

export async function criarViatura(dados: ViaturaInput): Promise<ResultadoDeGravar> {
  await exigirSessaoNaAccao();

  const validado = viaturaSchema.safeParse(dados);
  if (!validado.success) {
    return { erro: primeiroErro(validado.error) };
  }

  const v = validado.data;

  try {
    await db.insert(tabela).values({
      ...v,
      id: `v-${randomUUID().slice(0, 8)}`,
      /* Os slugs nascem aqui, e só aqui. Ver `atualizarViatura`. */
      marcaSlug: slugify(v.marca),
      modeloSlug: slugify(v.modelo),
    });
  } catch (erro) {
    console.error("[painel] falha ao criar viatura:", erro);
    return { erro: "Não foi possível guardar. Tente daqui a pouco." };
  }

  revalidarSite();
  redirect("/admin");
}

export async function atualizarViatura(
  id: string,
  dados: ViaturaInput,
): Promise<ResultadoDeGravar> {
  await exigirSessaoNaAccao();

  const validado = viaturaSchema.safeParse(dados);
  if (!validado.success) {
    return { erro: primeiroErro(validado.error) };
  }

  const v = validado.data;

  try {
    /*
      **Os slugs não são recalculados.**

      O PR #12 recalculava-os a cada gravação, e isso parecia arrumado até se
      pensar no que faz: o slug está no endereço da ficha, e corrigir uma
      gralha na marca mudava o URL da viatura. Todos os links já partilhados —
      WhatsApp, Facebook, resultados do Google — passavam a apontar para o
      nada.

      Congelar o slug tem a consequência oposta e aceitável: uma viatura
      renomeada mantém o endereço antigo. Se algum dia isso incomodar, a saída
      é a ficha fazer `redirect()` para o URL canónico quando os slugs não
      batem — não é recalcular na gravação.

      O `docs/admin/01` diz isto; o código do #12 dizia o contrário. Ganha o
      documento, porque tem razão.
    */
    const atualizadas = await db
      .update(tabela)
      .set({ ...v, atualizadoEm: new Date() })
      .where(eq(tabela.id, id))
      .returning({ id: tabela.id });

    if (atualizadas.length === 0) {
      return { erro: "Essa viatura já não existe." };
    }
  } catch (erro) {
    console.error("[painel] falha ao actualizar", id, erro);
    return { erro: "Não foi possível guardar. Tente daqui a pouco." };
  }

  revalidarSite();
  redirect("/admin");
}

/*
  A primeira mensagem, e não todas.

  Um formulário de 30 campos que devolve uma lista de erros manda a pessoa
  procurar; uma frase que nomeia o campo manda-a lá. Os erros do zod já vêm em
  português porque as mensagens estão no schema.
*/
function primeiroErro(erro: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const primeiro = erro.issues[0];
  if (!primeiro) return "Verifique os campos e tente de novo.";
  const campo = String(primeiro.path[0] ?? "");
  return campo ? `${campo}: ${primeiro.message}` : primeiro.message;
}


/*
  O carregamento de fotografias.

  Passa pelo servidor de propósito — ver `src/lib/painel/r2.ts`. Cada ficheiro
  é validado por si: um que falhe não deita abaixo os outros, e a mensagem diz
  qual foi e porquê, em vez de um "não foi possível carregar" que obriga a
  adivinhar.
*/
export type ResultadoDeFotos = { urls?: string[]; erro?: string };

export async function carregarFotos(
  dados: FormData,
  jaTem: number,
): Promise<ResultadoDeFotos> {
  await exigirSessaoNaAccao();

  const ficheiros = dados
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (ficheiros.length === 0) return { urls: [] };

  if (jaTem + ficheiros.length > FOTOS_MAXIMAS) {
    return {
      erro: `São ${FOTOS_MAXIMAS} fotos no máximo por viatura, e esta já tem ${jaTem}.`,
    };
  }

  const urls: string[] = [];
  try {
    for (const f of ficheiros) urls.push(await guardarFoto(f));
  } catch (erro) {
    /*
      As que já subiram ficam no bucket, mas não são devolvidas — ou seja, não
      entram na viatura. É lixo, e é a troca certa: perder as que passaram para
      dar uma mensagem clara sobre a que falhou é pior do que deixar uns
      ficheiros por usar.
    */
    if (erro instanceof ErroDeFoto) return { erro: erro.message };
    console.error("[painel] falha ao carregar fotos:", erro);
    return { erro: "Não foi possível carregar as fotos. Tente daqui a pouco." };
  }

  return { urls };
}
