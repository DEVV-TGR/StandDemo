import "server-only";
import { comEspaco } from "./codigo";
import { enviarEmail } from "@/lib/email";
import { SITE_NAME } from "@/lib/site";

/*
  O email com o código.

  O transporte — o `fetch` ao Resend, a classe de erro, o desvio para o
  terminal em desenvolvimento — vive em `@/lib/email`, partilhado com os
  formulários do site. Aqui fica só o que é do painel: o que o email diz.
*/

export { ErroAoEnviar } from "@/lib/email";

export async function enviarCodigo({
  para,
  codigo,
}: {
  para: string;
  codigo: string;
}): Promise<void> {
  const legivel = comEspaco(codigo);

  await enviarEmail({
    para,
    /*
      É por código e por destinatário, portanto um código novo continua a
      produzir um email novo — e dois cliques no mesmo dão um só.
    */
    chaveIdempotencia: `painel-${para}-${codigo}`,
    /*
      O código vai no **assunto**, de propósito. Quem estiver no telemóvel
      lê-o na notificação sem abrir nada — que é o momento em que está a
      olhar para o ecrã à espera dele.
    */
    assunto: `${legivel} — código de acesso ao painel`,
    texto: [
      `O seu código de acesso ao painel do ${SITE_NAME} é ${legivel}.`,
      "",
      "Vale 10 minutos e serve uma vez só.",
      "",
      "Se não foi você a pedir, ignore este email. Sem o código não se entra.",
    ].join("\n"),
  });
}
