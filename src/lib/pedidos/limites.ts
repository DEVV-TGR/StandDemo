import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/*
  Quantos pedidos se aceitam, e de onde — sem base de dados.

  O painel conta os pedidos de código numa tabela do Neon, e faz bem: ali a
  contagem é a defesa de uma porta. Aqui é outra coisa. Um formulário público
  tem de responder mesmo quando a base não existe — o CI compila e arranca o
  site sem uma única variável, e é assim que se garante que uma avaria na
  base não leva a montra atrás — por isso a contagem vive em memória.

  ## O que isto vale, e o que não vale

  Vale contra o que acontece de facto: alguém a carregar no botão dez vezes,
  um script simples a bater no formulário, um bot que preencheu tudo e insiste.
  Serve sobretudo para proteger a quota do Resend — 100 envios por dia no plano
  gratuito, partilhados com os códigos do painel — e a caixa de correio do
  cliente.

  Não vale contra volume distribuído: na Vercel cada instância tem a sua
  memória, e um ataque a sério passa por várias. Para isso está a regra do
  Firewall (`docs/admin/07`), que corre antes de haver compute. Este limite é
  a segunda linha, não a primeira.

  ## Dois tectos

  **Por origem, três em quinze minutos.** Quem preencheu e enviou não precisa
  de mais; quem esbarra nisto está a fazer outra coisa.

  **Por instância, trinta em quinze minutos**, somando todas as origens. É o
  que impede um script a rodar endereços de gastar a quota do dia numa tarde.
*/

const JANELA_MS = 15 * 60 * 1000;
const POR_ORIGEM = 3;
const POR_INSTANCIA = 30;

type Registo = Map<string, number[]>;

/*
  `globalThis` para sobreviver ao HMR em desenvolvimento, e à forma como o
  Next pode avaliar um módulo mais do que uma vez. Em produção é a mesma
  coisa que uma constante do módulo.
*/
const global = globalThis as unknown as { __limitesPedidos?: Registo };

function registo(): Registo {
  return (global.__limitesPedidos ??= new Map());
}

/*
  Na Vercel o `x-forwarded-for` é reescrito pela plataforma e o primeiro
  endereço é o de quem pediu. Fora da Vercel vale o que valer. O endereço vai
  em hash para a chave — não fica em memória em texto legível, e não faz
  falta que fique.
*/
async function origem(): Promise<string> {
  const cabecalhos = await headers();
  const ip =
    cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    cabecalhos.get("x-real-ip") ||
    "desconhecida";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/* Poda o que já saiu da janela; sem isto o mapa só cresce. */
function podar(agora: number): void {
  const desde = agora - JANELA_MS;
  for (const [chave, momentos] of registo()) {
    const vivos = momentos.filter((m) => m >= desde);
    if (vivos.length === 0) registo().delete(chave);
    else registo().set(chave, vivos);
  }
}

export type Orcamento = { pode: true } | { pode: false; esperarSegundos: number };

function faltaPara(maisAntigo: number | undefined, agora: number): number {
  if (maisAntigo === undefined) return Math.ceil(JANELA_MS / 1000);
  return Math.max(1, Math.ceil((JANELA_MS - (agora - maisAntigo)) / 1000));
}

/*
  Diz se ainda há orçamento, **sem o gastar**.

  Gasta-se só quando o pedido passa a validação e vai mesmo ser enviado — ver
  `anotarEnvio`. Contar antes de validar era castigar quem se enganou num
  campo: três tentativas com um email mal escrito e a pessoa ficava quinze
  minutos à porta sem ter enviado nada.
*/
export async function podeEnviar(): Promise<Orcamento> {
  const agora = Date.now();
  podar(agora);

  const meus = registo().get(await origem()) ?? [];
  if (meus.length >= POR_ORIGEM) {
    return { pode: false, esperarSegundos: faltaPara(meus[0], agora) };
  }

  const todos = [...registo().values()].flat().sort((a, b) => a - b);
  if (todos.length >= POR_INSTANCIA) {
    return { pode: false, esperarSegundos: faltaPara(todos[0], agora) };
  }

  return { pode: true };
}

export async function anotarEnvio(): Promise<void> {
  const chave = await origem();
  registo().set(chave, [...(registo().get(chave) ?? []), Date.now()]);
}
