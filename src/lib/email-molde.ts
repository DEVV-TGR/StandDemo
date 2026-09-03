import { agencia } from "@/data/agencia";
import type { Anexo } from "@/lib/email";
import { LOGO_DEVPLUS_BASE64, LOGO_DEVPLUS_ID } from "@/lib/logo-devplus";
import { SITE_NAME } from "@/lib/site";

/*
  O aspecto dos emails que saem daqui — os pedidos do site e o código do
  painel.

  ## Porque é escrito assim, e não como o resto do projecto

  Um email não é uma página. O motor que o desenha é o do Outlook, o do Gmail
  ou o do Mail do iPhone, e nenhum deles é um browser moderno: não há folha de
  estilos externa, não há `flex` nem `grid` de confiança, e classes CSS são
  descartadas por vários deles. Por isso isto é o oposto do resto do código —
  tabelas encaixadas, estilos escritos em cada elemento, e larguras em píxeis.
  É feio de ler e é o que funciona.

  Três decisões que valem a pena:

  **Vai sempre também em texto simples.** O `text` do Resend não é um resto: é
  o que aparece na pré-visualização das notificações e o que se lê quando o
  cliente de email recusa HTML. As duas versões dizem o mesmo.

  **O logótipo viaja no email.** Como anexo embutido, não como imagem remota —
  ver `logo-devplus.ts`.

  **Cores fixas, e fundo branco declarado.** Um email não tem tema claro e
  escuro fiável; o que há é clientes que invertem cores sozinhos. Declarar o
  fundo em cada célula é o que impede texto escuro sobre fundo escuro.
*/

/* A paleta do site, em hexadecimal — os `oklch` do `globals.css` convertidos. */
const TINTA = "#16181c";
const TINTA_SUAVE = "#5b6068";
const TINTA_TENUE = "#8a9099";
const LINHA = "#e2e5e8";
const PAPEL = "#f4f5f6";
const OURO = "#c0965a";
const OURO_CLARO = "#e3c286";
const LARANJA_DEVPLUS = "#ff780a";

/** O logótipo, pronto a juntar aos anexos de qualquer email. */
export const anexoDoLogo: Anexo = {
  nome: "devplus.png",
  tipo: "image/png",
  conteudo: LOGO_DEVPLUS_BASE64,
  id: LOGO_DEVPLUS_ID,
};

export type Linha = [rotulo: string, valor: string];
export type Bloco = { titulo: string; linhas: Linha[] };

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/*
  Um valor que é um telefone ou um email vira ligação.

  Não é enfeite: quem lê o pedido no telemóvel liga a partir daqui, e essa é
  a acção seguinte em quase todos os pedidos. Ter de copiar um número à mão
  para o teclado é o género de atrito que faz um contacto ficar para depois.
*/
function comLigacao(rotulo: string, valor: string): string {
  const seguro = escapar(valor);
  const estilo = `color:${TINTA};text-decoration:none;border-bottom:1px solid ${LINHA}`;

  if (rotulo === "Telefone") {
    const numero = valor.replace(/[^\d+]/g, "");
    return `<a href="tel:${numero}" style="${estilo}">${seguro}</a>`;
  }
  if (rotulo === "Email") {
    return `<a href="mailto:${seguro}" style="${estilo}">${seguro}</a>`;
  }
  return seguro;
}

function linhasHtml(linhas: Linha[]): string {
  return linhas
    .map(([rotulo, valor]) => {
      /*
        Um texto com parágrafos — o estado da viatura, os extras — não cabe
        numa linha de tabela ao lado do rótulo. Passa a ocupar as duas
        colunas, com as quebras respeitadas.
      */
      const longo = valor.length > 60 || valor.includes("\n");
      const conteudo = comLigacao(rotulo, valor).replace(/\n/g, "<br>");

      if (longo) {
        return `<tr>
  <td colspan="2" style="padding:10px 0 4px;border-top:1px solid ${LINHA}">
    <div style="font:500 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${TINTA_TENUE};padding-bottom:6px">${escapar(rotulo)}</div>
    <div style="font:400 15px/1.6 Arial,Helvetica,sans-serif;color:${TINTA}">${conteudo}</div>
  </td>
</tr>`;
      }

      return `<tr>
  <td style="padding:9px 16px 9px 0;border-top:1px solid ${LINHA};font:400 13px/1.4 Arial,Helvetica,sans-serif;color:${TINTA_SUAVE};white-space:nowrap;vertical-align:top">${escapar(rotulo)}</td>
  <td style="padding:9px 0;border-top:1px solid ${LINHA};font:400 15px/1.5 Arial,Helvetica,sans-serif;color:${TINTA};vertical-align:top">${conteudo}</td>
</tr>`;
    })
    .join("\n");
}

function blocoHtml(bloco: Bloco): string {
  return `<tr><td style="padding:22px 32px 0">
  <div style="font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${OURO};padding-bottom:2px">${escapar(bloco.titulo)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${linhasHtml(bloco.linhas)}
  </table>
</td></tr>`;
}

/*
  O rodapé com o crédito e o apoio.

  Está em todos os emails que saem do site, incluindo o código de acesso ao
  painel: é aí que alguém está com um problema e precisa de saber a quem
  perguntar. Um crédito sem contacto é publicidade; com contacto é apoio.
*/
function rodapeHtml(): string {
  return `<tr><td style="padding:26px 32px 30px;background:${PAPEL};border-top:1px solid ${LINHA};border-radius:0 0 4px 4px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding-right:12px;vertical-align:middle">
        <img src="cid:${LOGO_DEVPLUS_ID}" width="36" height="36" alt="${escapar(agencia.nome)}" style="display:block;width:36px;height:36px;border:0;border-radius:7px">
      </td>
      <td style="vertical-align:middle;font:400 13px/1.55 Arial,Helvetica,sans-serif;color:${TINTA_SUAVE}">
        Site desenvolvido pela <a href="${agencia.url}" style="color:${TINTA};font-weight:600;text-decoration:none;border-bottom:1px solid ${LARANJA_DEVPLUS}">${escapar(agencia.nome)}</a><br>
        Apoio: <a href="mailto:${agencia.emailSuporte}" style="color:${TINTA_SUAVE};text-decoration:none;border-bottom:1px solid ${LINHA}">${agencia.emailSuporte}</a>
      </td>
    </tr>
  </table>
</td></tr>`;
}

export function moldeHtml({
  etiqueta,
  titulo,
  entrada,
  blocos = [],
  destaque,
  nota,
}: {
  /** A linha pequena por cima do título — de onde veio o email. */
  etiqueta: string;
  titulo: string;
  /** Uma frase a abrir, opcional. */
  entrada?: string;
  blocos?: Bloco[];
  /** O que se lê de longe: o código de acesso, por exemplo. */
  destaque?: { valor: string; nota: string };
  /** A frase no fim do corpo, antes do rodapé. */
  nota?: string;
}): string {
  return `<!doctype html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapar(titulo)}</title></head>
<body style="margin:0;padding:0;background:${PAPEL};-webkit-text-size-adjust:100%">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPEL}">
<tr><td align="center" style="padding:28px 12px">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${LINHA};border-radius:4px">

  <tr><td style="padding:26px 32px;background:${TINTA};border-radius:4px 4px 0 0">
    <div style="font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${OURO};padding-bottom:7px">${escapar(etiqueta)}</div>
    <div style="font:400 22px/1.3 Georgia,'Times New Roman',serif;color:#ffffff">${escapar(titulo)}</div>
    <div style="font:400 12px/1.4 Arial,Helvetica,sans-serif;color:${OURO_CLARO};opacity:.75;padding-top:8px">${escapar(SITE_NAME)}</div>
  </td></tr>

  ${entrada ? `<tr><td style="padding:24px 32px 0;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:${TINTA_SUAVE}">${escapar(entrada)}</td></tr>` : ""}

  ${
    destaque
      ? `<tr><td style="padding:26px 32px 4px">
    <div style="background:${PAPEL};border:1px solid ${LINHA};border-radius:4px;padding:22px;text-align:center">
      <div style="font:700 34px/1.2 'Courier New',Courier,monospace;letter-spacing:.14em;color:${TINTA}">${escapar(destaque.valor)}</div>
      <div style="font:400 13px/1.5 Arial,Helvetica,sans-serif;color:${TINTA_SUAVE};padding-top:10px">${escapar(destaque.nota)}</div>
    </div>
  </td></tr>`
      : ""
  }

  ${blocos.map(blocoHtml).join("\n")}

  ${
    nota
      ? `<tr><td style="padding:24px 32px 28px">
    <div style="border-left:3px solid ${OURO};padding:2px 0 2px 14px;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:${TINTA_SUAVE}">${escapar(nota)}</div>
  </td></tr>`
      : `<tr><td style="padding:0 32px 28px"></td></tr>`
  }

  ${rodapeHtml()}

</table>

</td></tr>
</table>
</body></html>`;
}

/** O mesmo conteúdo em texto simples, para quem recusa HTML. */
export function moldeTexto({
  titulo,
  entrada,
  blocos = [],
  destaque,
  nota,
}: {
  titulo: string;
  entrada?: string;
  blocos?: Bloco[];
  destaque?: { valor: string; nota: string };
  nota?: string;
}): string {
  const partes: string[] = [titulo];

  if (entrada) partes.push(entrada);
  if (destaque) partes.push(`${destaque.valor}\n${destaque.nota}`);

  for (const bloco of blocos) {
    partes.push(
      [
        bloco.titulo.toUpperCase(),
        ...bloco.linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
      ].join("\n"),
    );
  }

  if (nota) partes.push(nota);

  partes.push(
    `— Site desenvolvido pela ${agencia.nome} (${agencia.url}). Apoio: ${agencia.emailSuporte}`,
  );

  return partes.join("\n\n");
}
