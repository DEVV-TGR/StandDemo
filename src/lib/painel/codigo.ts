import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { codigosAcesso } from "@/db/schema";
import { chave } from "./chaves";

/*
  O código de seis algarismos.

  ## Hash, e não o código

  `SHA-256`, nunca o código em texto. Se a base for lida por quem não devia, os
  códigos activos não servem para entrar.

  E aqui o hash chega: um hash de seis algarismos quebra-se num instante *se
  quem o tem puder experimentar à vontade* — e para chegar a este é preciso já
  ter as credenciais da base, altura em que o código de entrada é o menor dos
  problemas. `bcrypt` seria lentidão sem ganho: isto expira em dez minutos e
  tem cinco tentativas.

  ## Uso único

  Ao ser aceite, a linha é marcada como consumida. Um código que já entrou não
  volta a entrar, mesmo dentro dos dez minutos — o que interessa se o email for
  lido mais tarde por outra pessoa.
*/

export const NOME_DO_DESAFIO = "imperio_desafio";

export const VALIDADE_MS = 10 * 60 * 1000;

/*
  Cinco, e não uma.

  A documentação original pedia uma tentativa com bloqueio de cinco minutos.
  Mudou depois de se fazer a conta: com cinco tentativas por código e três
  pedidos por quinze minutos, um atacante tem quinze hipóteses em quinze
  minutos num espaço de um milhão — 0,0015%. Com uma tentativa seriam três em
  vez de quinze. A diferença é irrelevante para quem ataca e brutal para quem
  troca um dígito.

  O limite que faz o trabalho é o de **pedidos de código**, em `limites.ts`.
*/
const TENTATIVAS = 5;

/*
  `randomInt` e não `Math.random()`: o segundo é previsível a partir de umas
  quantas saídas, e um código de entrada previsível não é um código. Zeros à
  esquerda para o "000042" ser tão provável como o "384921".
*/
export function gerarCodigo(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** `"384921"` → `"384 921"`, para se ler de uma vez no assunto do email. */
export function comEspaco(codigo: string): string {
  return `${codigo.slice(0, 3)} ${codigo.slice(3)}`;
}

function hashDoCodigo(codigo: string): string {
  return createHash("sha256").update(codigo).digest("hex");
}

/*
  O cookie leva o `id` e uma assinatura, e mais nada — o código não vai lá
  dentro. Assinado para que o `id` não possa ser inventado: sem isso, alguém
  pedia um código para o seu próprio endereço e depois trocava o `id` pelo de
  outra pessoa.
*/
async function selarDesafio(id: string): Promise<string> {
  const selo = createHmac("sha256", await chave("desafio"))
    .update(`d1.${id}`)
    .digest("base64url");
  return `d1.${id}.${selo}`;
}

async function abrirDesafio(cookie: string | undefined): Promise<string | null> {
  if (!cookie) return null;

  const partes = cookie.split(".");
  if (partes.length !== 3 || partes[0] !== "d1") return null;
  const [, id, selo] = partes;

  const esperado = Buffer.from((await selarDesafio(id)).split(".")[2]);
  const recebido = Buffer.from(selo);
  if (esperado.length !== recebido.length) return null;
  if (!timingSafeEqual(esperado, recebido)) return null;

  return id;
}

/**
 * Guarda um código novo e devolve o cookie que aponta para ele.
 *
 * **Um código novo mata os anteriores da mesma conta.** Não chega apagar o do
 * cookie de quem está a pedir: quem pedir de outro browser deixaria o primeiro
 * vivo, e passaria a haver dois códigos válidos ao mesmo tempo — o que
 * multiplica as tentativas disponíveis pelo número de códigos em aberto.
 *
 * Aproveita a passagem para limpar os expirados, e assim não é preciso um cron
 * a lembrar-se de o fazer nem a tabela cresce sozinha.
 */
export async function criarDesafio(email: string, codigo: string): Promise<string> {
  const id = randomBytes(16).toString("base64url");

  await db
    .delete(codigosAcesso)
    .where(or(lt(codigosAcesso.expiraEm, new Date()), eq(codigosAcesso.email, email)));

  await db.insert(codigosAcesso).values({
    id,
    email,
    codigoHash: hashDoCodigo(codigo),
    expiraEm: new Date(Date.now() + VALIDADE_MS),
  });

  return selarDesafio(id);
}

export type Veredicto =
  | { estado: "certo"; email: string }
  | { estado: "errado"; restam: number }
  | { estado: "expirado" }
  | { estado: "sem-desafio" };

export async function conferirCodigo(
  cookie: string | undefined,
  escrito: string,
): Promise<Veredicto> {
  const id = await abrirDesafio(cookie);
  if (!id) return { estado: "sem-desafio" };

  /*
    Conta **antes** de comparar, e não depois.

    Contar depois deixava passar uma tentativa a mais em cada corrida: dois
    pedidos ao mesmo tempo comparavam os dois antes de qualquer um somar. Somar
    primeiro é o que faz a quinta ser mesmo a quinta — e o `UPDATE … RETURNING`
    torna a soma atómica, sem ler-e-escrever em dois tempos.

    O `WHERE` também filtra pela validade e pelo consumo: um código expirado ou
    já usado não incrementa nada e não devolve linha nenhuma.
  */
  const [linha] = await db
    .update(codigosAcesso)
    .set({ tentativas: sql`${codigosAcesso.tentativas} + 1` })
    .where(
      and(
        eq(codigosAcesso.id, id),
        isNull(codigosAcesso.consumidoEm),
        sql`${codigosAcesso.expiraEm} > now()`,
      ),
    )
    .returning({
      email: codigosAcesso.email,
      codigoHash: codigosAcesso.codigoHash,
      tentativas: codigosAcesso.tentativas,
    });

  if (!linha) return { estado: "expirado" };

  if (linha.tentativas > TENTATIVAS) {
    await db.delete(codigosAcesso).where(eq(codigosAcesso.id, id));
    return { estado: "expirado" };
  }

  const esperado = Buffer.from(linha.codigoHash);
  const obtido = Buffer.from(hashDoCodigo(escrito.replace(/\D/g, "")));
  const bate = esperado.length === obtido.length && timingSafeEqual(esperado, obtido);

  if (!bate) {
    const restam = TENTATIVAS - linha.tentativas;
    if (restam <= 0) await db.delete(codigosAcesso).where(eq(codigosAcesso.id, id));
    return { estado: "errado", restam: Math.max(0, restam) };
  }

  /* Uso único: entrou, acabou. */
  await db
    .update(codigosAcesso)
    .set({ consumidoEm: new Date() })
    .where(eq(codigosAcesso.id, id));

  return { estado: "certo", email: linha.email };
}

/** Para quem é o código que está a meio, para o segundo ecrã saber a quem falar. */
export async function emailDoDesafio(cookie: string | undefined): Promise<string | null> {
  const id = await abrirDesafio(cookie);
  if (!id) return null;

  const [linha] = await db
    .select({ email: codigosAcesso.email })
    .from(codigosAcesso)
    .where(
      and(
        eq(codigosAcesso.id, id),
        isNull(codigosAcesso.consumidoEm),
        sql`${codigosAcesso.expiraEm} > now()`,
      ),
    )
    .limit(1);

  return linha?.email ?? null;
}

/** Deita fora o desafio a meio — usa-se ao pedir outro código. */
export async function apagarDesafio(cookie: string | undefined): Promise<void> {
  const id = await abrirDesafio(cookie);
  if (!id) return;
  await db.delete(codigosAcesso).where(eq(codigosAcesso.id, id));
}
