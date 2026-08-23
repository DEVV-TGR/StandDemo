import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { configuracao } from "@/db/schema";
import { chave } from "./chaves";

/*
  Os dois cookies que dizem quem está do outro lado.

  | cookie | diz | dura |
  |---|---|---|
  | `imperio_sessao` | "esta pessoa entrou" | 8 horas |
  | `imperio_aparelho` | "este aparelho já passou pelo código" | 30 dias |

  Ambos são, na prática, JWTs HS256 sem a papelada: `v.corpo.assinatura`, com o
  corpo em JSON e base64url. Não se usa o `jose`: a razão histórica para a
  documentação do Next o sugerir era o middleware correr em Edge, onde não há
  `node:crypto` — e no Next 16 o proxy corre em Node.

  ## Os quatro cuidados

  1. **A assinatura verifica-se antes de o JSON ser lido.** Um `JSON.parse`
     sobre bytes que ainda não se sabe se são nossos é superfície de ataque de
     graça.
  2. **A validade vai dentro do corpo assinado, e é verificada.** O `Max-Age` do
     cookie é do cliente e não vale nada.
  3. **`timingSafeEqual` com guarda de comprimento** — atira se os buffers
     tiverem tamanhos diferentes.
  4. **O rótulo entra dentro do HMAC**, e cada rótulo usa uma chave diferente
     (ver `chaves.ts`). Um selo de sessão não pode servir de selo de aparelho.

  ## Porque é que o aparelho tem registo na base e a sessão não

  Para poder ser **revogado**. A sessão dura oito horas e passa; um aparelho
  lembrado dura um mês, e um mês é tempo de mais para não haver forma de dizer
  "esquece aquele telemóvel". O cookie leva um segredo, a base guarda o hash
  dele, e apagar a linha corta o acesso na hora.

  ## Porque é que o token do aparelho não roda

  A prática recomendada é gerar um token novo a cada utilização, para detectar
  cópias. Aqui não se faz, e é decisão consciente: duas abas abertas correm a
  rotação ao mesmo tempo e uma fica com um token morto, e a resposta habitual a
  essa detecção — apagar todos os aparelhos — transforma uma corrida banal numa
  expulsão geral. Com uma pessoa a usar isto, a probabilidade de duas abas é
  muito maior do que a de um cookie roubado, e a revogação manual resolve o
  caso raro sem estragar o comum.
*/

export const NOME_DO_COOKIE = "imperio_sessao";
export const NOME_DO_APARELHO = "imperio_aparelho";

/* Oito horas — um dia de trabalho. Quem fecha o stand não fica com sessão. */
export const VALIDADE_MS = 8 * 60 * 60 * 1000;

/*
  Trinta dias, e é conforto assumido: a alternativa era pedir o código de cada
  vez, e quem tem de ir ao email para corrigir um preço acaba por não corrigir
  o preço — que é o problema que o painel existe para resolver.
*/
export const VALIDADE_APARELHO_MS = 30 * 24 * 60 * 60 * 1000;

type Rotulo = "sessao" | "aparelho";

const VERSAO = "s1";

async function assinar(rotulo: Rotulo, corpo: string): Promise<string> {
  return createHmac("sha256", await chave(rotulo))
    .update(`${VERSAO}.${rotulo}.${corpo}`)
    .digest("base64url");
}

async function selarComo(
  rotulo: Rotulo,
  dados: Record<string, unknown>,
  validade: number,
): Promise<string> {
  const corpo = Buffer.from(
    JSON.stringify({ ...dados, exp: Date.now() + validade }),
  ).toString("base64url");

  return `${VERSAO}.${corpo}.${await assinar(rotulo, corpo)}`;
}

async function abrirComo(
  rotulo: Rotulo,
  valor: string | undefined,
): Promise<Record<string, unknown> | null> {
  if (!valor) return null;

  const partes = valor.split(".");
  if (partes.length !== 3 || partes[0] !== VERSAO) return null;
  const [, corpo, selo] = partes;

  /*
    A chave que verifica o selo vem da base, e a base pode estar em baixo.

    Nesse caso não se consegue dizer se este cookie é nosso — e **não conseguir
    verificar é motivo para não confiar, nunca para confiar**. Falha fechado:
    devolve `null`, quem estava lá dentro dá por si no ecrã de entrada, e é lá
    que a acção explica o que se passa em português.

    Sem isto, o erro subia até ao topo e a página do painel rebentava com o ecrã
    de avaria da Vercel — que não explica nada e, ainda por cima, aparecia igual
    a quem tinha sessão e a quem não tinha.
  */
  let esperado: Buffer;
  try {
    esperado = Buffer.from(await assinar(rotulo, corpo));
  } catch (erro) {
    console.error("[painel] não foi possível verificar o cookie:", erro);
    return null;
  }

  const recebido = Buffer.from(selo);
  if (esperado.length !== recebido.length) return null;
  if (!timingSafeEqual(esperado, recebido)) return null;

  /* Só a partir daqui é que estes bytes são de confiança. */
  try {
    const lido: unknown = JSON.parse(
      Buffer.from(corpo, "base64url").toString("utf8"),
    );
    if (typeof lido !== "object" || lido === null) return null;

    const { exp } = lido as Record<string, unknown>;
    if (typeof exp !== "number" || exp < Date.now()) return null;

    return lido as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function selar(email: string): Promise<string> {
  return selarComo("sessao", { e: email }, VALIDADE_MS);
}

/** Quem está do outro lado, se o selo for nosso e ainda estiver na validade. */
export async function abrir(
  valor: string | undefined,
): Promise<{ email: string } | null> {
  const lido = await abrirComo("sessao", valor);
  return typeof lido?.e === "string" ? { email: lido.e } : null;
}

function chaveDoAparelho(segredo: string): string {
  return `aparelho:${createHash("sha256").update(segredo).digest("hex").slice(0, 32)}`;
}

/*
  Um aparelho novo: o cookie leva um segredo aleatório, a base guarda o hash.

  O segredo original nunca é guardado — se a base for lida, os cookies que já
  andam por aí não podem ser reconstruídos a partir dela.
*/
export async function lembrarAparelho(email: string): Promise<string> {
  const segredo = randomBytes(32).toString("base64url");

  await db
    .insert(configuracao)
    .values({
      chave: chaveDoAparelho(segredo),
      valor: JSON.stringify({ email, exp: Date.now() + VALIDADE_APARELHO_MS }),
    })
    .onConflictDoNothing({ target: configuracao.chave });

  return selarComo("aparelho", { e: email, s: segredo }, VALIDADE_APARELHO_MS);
}

/*
  Este aparelho já passou pelo código, e foi **este** email a passar por ele.

  Duas verificações, e as duas são precisas: a assinatura do cookie (que prova
  que fomos nós a emiti-lo) e o registo na base (que prova que não foi revogado
  desde então). Sem a segunda, o botão de esquecer aparelhos não fazia nada.

  A comparação do email não é decorativa: sem ela, um aparelho lembrado para
  uma pessoa da lista deixava outra entrar sem código.
*/
export async function aparelhoConhecido(
  valor: string | undefined,
  email: string,
): Promise<boolean> {
  const lido = await abrirComo("aparelho", valor);
  if (lido?.e !== email || typeof lido.s !== "string") return false;

  const [linha] = await db
    .select({ valor: configuracao.valor })
    .from(configuracao)
    .where(eq(configuracao.chave, chaveDoAparelho(lido.s)))
    .limit(1);

  if (!linha) return false;

  try {
    const registo = JSON.parse(linha.valor) as { email?: string; exp?: number };
    return registo.email === email && (registo.exp ?? 0) > Date.now();
  } catch {
    return false;
  }
}

/** Esquece este aparelho — o cookie continua a existir, mas deixa de valer. */
export async function esquecerAparelho(valor: string | undefined): Promise<void> {
  const lido = await abrirComo("aparelho", valor);
  if (typeof lido?.s !== "string") return;
  await db.delete(configuracao).where(eq(configuracao.chave, chaveDoAparelho(lido.s)));
}

/*
  As opções dos cookies.

  `path: "/admin"` e não `/`: assim nenhum deles viaja nos pedidos às páginas
  públicas, que são servidas do CDN e não têm nada que ver com sessões.

  `secure` fica desligado em desenvolvimento, senão o browser recusa o cookie
  em `http://localhost` e não há forma de entrar na própria máquina.
*/
export function opcoesDoCookie(validadeMs = VALIDADE_MS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: Math.floor(validadeMs / 1000),
  };
}
