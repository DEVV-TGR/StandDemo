import "server-only";
import { comEspaco } from "./codigo";
import { SITE_NAME } from "@/lib/site";

/*
  O email com o código.

  Sem SDK — só `fetch`. O Resend serve isto num POST, e uma chamada HTTP não
  justifica uma árvore de dependências.
*/

/* Estado inventado para "nem chegámos a falar com o Resend". */
const SEM_CONFIGURACAO = 0;

export class ErroAoEnviar extends Error {
  readonly estado: number;
  readonly detalhe: string;

  constructor(estado: number, detalhe: string) {
    super(`O Resend respondeu ${estado}: ${detalhe}`);
    this.name = "ErroAoEnviar";
    this.estado = estado;
    this.detalhe = detalhe;
  }

  /*
    O que se mostra a quem está à espera do código. Nunca o erro cru do
    Resend — esse vai para o registo, onde é útil, e não para um ecrã onde só
    assusta.

    **Quatro causas, quatro frases.** A tentação é ter uma mensagem genérica
    para tudo, e é um erro: as três causas mais prováveis pedem acções
    diferentes, e mandar procurar no sítio errado custa mais tempo do que não
    dizer nada. O domínio do remetente, em particular, é o engano mais comum e
    o que menos se suspeita.
  */
  get paraOEcra(): string {
    if (this.estado === SEM_CONFIGURACAO) {
      return `O painel ainda não consegue enviar emails — ${this.detalhe} Ver docs/admin/07.`;
    }
    if (this.estado === 403) {
      return (
        "O domínio do remetente não está verificado no Resend. Confirme o que " +
        "está como Verified em Resend → Domains e acerte o RESEND_REMETENTE — " +
        "atenção que a raiz e o subdomínio contam como domínios diferentes."
      );
    }
    if (this.estado === 401) {
      return "A chave do serviço de email foi recusada. Verifique o RESEND_API_KEY.";
    }
    return (
      "Não foi possível enviar o email neste momento. Tente daqui a pouco; se " +
      "continuar, veja os registos do Resend."
    );
  }
}

function chaveDeApi(): string {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    throw new ErroAoEnviar(SEM_CONFIGURACAO, "falta a variável RESEND_API_KEY.");
  }
  return chave;
}

function remetente(): string {
  const de = process.env.RESEND_REMETENTE;
  if (!de) {
    throw new ErroAoEnviar(SEM_CONFIGURACAO, "falta a variável RESEND_REMETENTE.");
  }
  return de;
}

/*
  Em desenvolvimento, e só aí, o código sai no terminal quando não há chave.

  **Não é uma porta traseira**: o código continua a ser gerado, exigido, e a ter
  de bater certo. Muda só por onde sai — e sai para a mesma pessoa que está a
  tentar entrar, na sua própria máquina. Em produção este ramo não existe,
  porque `NODE_ENV` é `production` e a condição nunca é verdadeira.
*/
function paraOTerminal(para: string, legivel: string): boolean {
  if (process.env.NODE_ENV === "production" || process.env.RESEND_API_KEY) {
    return false;
  }

  const linha = "─".repeat(46);
  console.log(
    `\n┌${linha}┐\n` +
      `│  CÓDIGO DE ACESSO AO PAINEL${" ".repeat(18)}│\n` +
      `│  ${legivel}${" ".repeat(39)}│\n` +
      `│  para ${para}${" ".repeat(Math.max(0, 39 - para.length))}│\n` +
      `└${linha}┘\n` +
      `(sem RESEND_API_KEY — em produção este ramo não existe)\n`,
  );
  return true;
}

export async function enviarCodigo({
  para,
  codigo,
}: {
  para: string;
  codigo: string;
}): Promise<void> {
  const legivel = comEspaco(codigo);

  if (paraOTerminal(para, legivel)) return;

  const de = remetente();

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chaveDeApi()}`,
      "Content-Type": "application/json",
      /*
        Dois cliques no botão dão dois pedidos iguais; com esta chave o Resend
        manda um email só. É por código e por destinatário, portanto um código
        novo continua a produzir um email novo.
      */
      "Idempotency-Key": `painel-${para}-${codigo}`,
    },
    body: JSON.stringify({
      from: de,
      to: [para],
      reply_to: de,
      /*
        O código vai no **assunto**, de propósito. Quem estiver no telemóvel
        lê-o na notificação sem abrir nada — que é o momento em que está a
        olhar para o ecrã à espera dele.
      */
      subject: `${legivel} — código de acesso ao painel`,
      text: [
        `O seu código de acesso ao painel do ${SITE_NAME} é ${legivel}.`,
        "",
        "Vale 10 minutos e serve uma vez só.",
        "",
        "Se não foi você a pedir, ignore este email. Sem o código não se entra.",
      ].join("\n"),
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    /* O erro cru vai para o registo; para o ecrã vai o `paraOEcra`. */
    console.error(`[painel] Resend ${resposta.status}: ${detalhe.slice(0, 300)}`);
    throw new ErroAoEnviar(resposta.status, detalhe.slice(0, 200));
  }
}
