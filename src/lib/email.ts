import "server-only";

/*
  O envio de email, para o painel e para o site.

  Sem SDK — só `fetch`. O Resend serve isto num POST, e uma chamada HTTP não
  justifica uma árvore de dependências.

  Começou por viver dentro do painel, para os códigos de acesso. Quando os
  formulários públicos passaram a precisar do mesmo transporte, o `fetch`, a
  classe de erro e o desvio de desenvolvimento vieram para aqui; o que é do
  painel — o assunto com o código, a chave de idempotência por código — ficou
  em `painel/email.ts`.
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

    Estas frases são para quem administra o painel. Um visitante do site não
    as vê — o formulário público traduz qualquer erro numa frase só, que o
    encaminha para o WhatsApp.
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

export type Anexo = {
  nome: string;
  tipo: string;
  /** O conteúdo em base64, tal como o Resend o quer. */
  conteudo: string;
  /*
    Com `id`, a imagem deixa de ser um anexo à parte e passa a desenhar-se
    dentro da mensagem, onde o HTML lhe chamar `cid:<id>`. É assim que o
    logótipo aparece sem depender de o cliente de email aceitar carregar
    imagens de fora.
  */
  id?: string;
};

export type Email = {
  para: string;
  assunto: string;
  /*
    As duas versões saem sempre juntas. O `texto` não é um resto: é o que
    aparece na pré-visualização das notificações, o que se lê quando o cliente
    de email recusa HTML, e o que impede a mensagem de contar como só-imagem
    para os filtros de spam.
  */
  texto: string;
  html?: string;
  /** Para onde vai a resposta. Por omissão, o remetente. */
  responderA?: string;
  /** Dois cliques no botão dão dois pedidos iguais; com esta chave sai um email só. */
  chaveIdempotencia: string;
  anexos?: Anexo[];
};

/*
  Em desenvolvimento, e só aí, o email sai no terminal quando não há chave.

  **Não é uma porta traseira**: no painel o código continua a ser gerado,
  exigido, e a ter de bater certo — muda só por onde sai, e sai para a mesma
  pessoa que está a tentar entrar, na sua própria máquina. Nos formulários do
  site é o que permite testar o envio de ponta a ponta sem gastar quota. Em
  produção este ramo não existe, porque `NODE_ENV` é `production` e a
  condição nunca é verdadeira.
*/
function paraOTerminal(email: Email): boolean {
  if (process.env.NODE_ENV === "production" || process.env.RESEND_API_KEY) {
    return false;
  }

  const linha = "─".repeat(62);
  const anexos = email.anexos?.length
    ? `\n(${email.anexos.length} ${email.anexos.length === 1 ? "anexo" : "anexos"}, ${Math.round(
        email.anexos.reduce((soma, a) => soma + a.conteudo.length * 0.75, 0) / 1024,
      )} KB)`
    : "";

  console.log(
    `\n┌${linha}┐\n` +
      `│  EMAIL (sem RESEND_API_KEY — em produção este ramo não existe)\n` +
      `│  para: ${email.para}\n` +
      (email.responderA ? `│  responder a: ${email.responderA}\n` : "") +
      `│  assunto: ${email.assunto}\n` +
      `├${linha}┤\n` +
      email.texto
        .split("\n")
        .map((l) => `│  ${l}`)
        .join("\n") +
      `${anexos}\n└${linha}┘\n`,
  );
  return true;
}

export async function enviarEmail(email: Email): Promise<void> {
  if (paraOTerminal(email)) return;

  const de = remetente();

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chaveDeApi()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": email.chaveIdempotencia,
    },
    body: JSON.stringify({
      from: de,
      to: [email.para],
      reply_to: email.responderA ?? de,
      subject: email.assunto,
      text: email.texto,
      ...(email.html ? { html: email.html } : {}),
      ...(email.anexos?.length
        ? {
            attachments: email.anexos.map((a) => ({
              filename: a.nome,
              content_type: a.tipo,
              content: a.conteudo,
              ...(a.id ? { content_id: a.id } : {}),
            })),
          }
        : {}),
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    /* O erro cru vai para o registo; para o ecrã vai o `paraOEcra`. */
    console.error(`[email] Resend ${resposta.status}: ${detalhe.slice(0, 300)}`);
    throw new ErroAoEnviar(resposta.status, detalhe.slice(0, 200));
  }
}
