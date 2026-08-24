import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { tentativasAcesso } from "@/db/schema";

/*
  Quantas vezes se pode pedir um código, e de onde.

  Sem palavra-passe, isto deixou de ser defesa em profundidade e passou a ser
  **a** defesa. Um código de seis algarismos são um milhão de hipóteses; sem
  limites, um script testa-as numa tarde.

  ## Os dois limites, e porque é preciso os dois

  **Por código, cinco tentativas** — essa contagem vive na linha do próprio
  código, em `codigo.ts`. Reduz a janela de um milhão para cinco.

  **Por email, três pedidos em quinze minutos.** Sem este, o anterior não vale
  nada: quem ataca faz cinco tentativas, pede outro código, mais cinco, e assim
  sucessivamente até acertar. É este limite que fecha essa porta — e é o que
  falta em quase todas as implementações de OTP que se vêem.

  Serve também para uma coisa mais prosaica: impede que alguém use o formulário
  para encher a caixa de correio do cliente, e que se gastem os 100 envios
  diários do plano gratuito do Resend numa tarde.

  **Por IP, dez pedidos em quinze minutos.** Apanha quem tenta vários endereços
  a partir do mesmo sítio — a sondagem de quem procura descobrir que emails têm
  acesso.

  ## O que isto não faz

  Não trava volume bruto na borda: para isso está a regra do Vercel Firewall
  (`docs/admin/07`), que corre antes de haver compute. Estes limites são os que
  o firewall não consegue fazer, porque são por email e não por endereço de
  rede.
*/

const JANELA_MS = 15 * 60 * 1000;
const POR_EMAIL = 3;
const POR_IP = 10;

/*
  O email vai em hash para a chave.

  Não é criptografia — é para a lista de quem tem acesso ao painel não ficar
  legível em texto na base, onde não faz falta nenhuma. Quem abrir a tabela vê
  `email:9f86d0…` e não `email:cliente@…`.
*/
function chaveDoEmail(email: string): string {
  const digest = createHash("sha256").update(email.toLowerCase()).digest("hex");
  return `email:${digest.slice(0, 32)}`;
}

/*
  Na Vercel o `x-forwarded-for` é reescrito pela plataforma e o primeiro
  endereço é o de quem pediu — não é um cabeçalho que o cliente controle. Fora
  da Vercel vale o que valer, e é por isso que o limite por IP é o terceiro da
  lista e não o primeiro.
*/
async function origem(): Promise<string> {
  const cabecalhos = await headers();
  return (
    cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    cabecalhos.get("x-real-ip") ||
    "desconhecida"
  );
}

type Contagem = { total: number; maisAntigo: Date | null };

async function registarEContar(chave: string, acao: string): Promise<Contagem> {
  const desde = new Date(Date.now() - JANELA_MS);

  await db.insert(tentativasAcesso).values({ id: randomUUID(), chave, acao });

  const linhas = await db
    .select({ ocorridoEm: tentativasAcesso.ocorridoEm })
    .from(tentativasAcesso)
    .where(
      and(
        eq(tentativasAcesso.chave, chave),
        eq(tentativasAcesso.acao, acao),
        gte(tentativasAcesso.ocorridoEm, desde),
      ),
    )
    .orderBy(tentativasAcesso.ocorridoEm);

  return { total: linhas.length, maisAntigo: linhas[0]?.ocorridoEm ?? null };
}

/*
  Consome uma unidade do orçamento e diz se ainda havia.

  **Conta sempre, mesmo para emails que não estão na lista.** É essencial: se
  só contasse para os autorizados, o comportamento a partir do quarto pedido
  diria a quem está do outro lado quais os endereços que existem — que é
  exactamente a enumeração que a resposta uniforme do ecrã existe para evitar.
*/
/*
  Devolve **quanto falta** e não só um sim/não.

  A versão anterior dizia apenas que não se podia pedir, e o ecrã respondia com
  a mesma frase vaga de sempre. Quem esbarrava no limite não tinha como
  distinguir isso de uma avaria — e foi o que aconteceu em uso real: cinco
  pedidos, bloqueio de quinze minutos, e um ecrã que não dizia nada.

  ## Porque é que dizer o tempo não abre porta nenhuma

  O contador corre **antes** de se saber se o email está na lista, e conta para
  todos por igual. Logo, "espere sete minutos" é exactamente a mesma resposta
  para um endereço com acesso e para um sem — não distingue os dois, que é o
  que a resposta uniforme existe para garantir.

  O que revela é que houve pedidos a mais deste email ou deste IP, e isso quem
  os fez já sabe.
*/
export type Orcamento =
  | { pode: true }
  | { pode: false; esperarSegundos: number };

function faltaPara(maisAntigo: Date | null): number {
  if (!maisAntigo) return Math.ceil(JANELA_MS / 1000);
  const passou = Date.now() - maisAntigo.getTime();
  return Math.max(1, Math.ceil((JANELA_MS - passou) / 1000));
}

export async function podePedirCodigo(email: string): Promise<Orcamento> {
  /* Limpa o que já saiu da janela, na mesma passagem. Sem isto a tabela cresce
     para sempre e as contagens ficam cada vez mais lentas. */
  await db
    .delete(tentativasAcesso)
    .where(lt(tentativasAcesso.ocorridoEm, new Date(Date.now() - JANELA_MS)));

  const [porEmail, porIp] = await Promise.all([
    registarEContar(chaveDoEmail(email), "pedido"),
    registarEContar(`ip:${await origem()}`, "pedido"),
  ]);

  if (porEmail.total > POR_EMAIL) {
    return { pode: false, esperarSegundos: faltaPara(porEmail.maisAntigo) };
  }
  if (porIp.total > POR_IP) {
    return { pode: false, esperarSegundos: faltaPara(porIp.maisAntigo) };
  }
  return { pode: true };
}

/** `430` → `"7 minutos"`, `45` → `"menos de um minuto"`. */
export function emPortugues(segundos: number): string {
  if (segundos < 60) return "menos de um minuto";
  const minutos = Math.ceil(segundos / 60);
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
}

/*
  Fica no registo de execução da Vercel. Se algum dia houver um ataque a sério,
  é a única forma de saber que houve — e de ver de onde veio.

  O email vai em claro aqui, ao contrário do que vai para a base: um registo de
  servidor serve para se perceber o que aconteceu, e um hash não serve para
  isso. **Nunca o código**, nem sequer truncado.
*/
export async function anotar(oQue: string, email: string): Promise<void> {
  console.warn(`[painel] ${oQue} — ${email} — de ${await origem()}`);
}
