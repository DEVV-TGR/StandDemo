import "server-only";
import { comEspaco } from "./codigo";
import { enviarEmail } from "@/lib/email";
import { anexoDoLogo, moldeHtml, moldeTexto } from "@/lib/email-molde";
import { SITE_NAME } from "@/lib/site";

/*
  O email com o código.

  O transporte — o `fetch` ao Resend, a classe de erro, o desvio para o
  terminal em desenvolvimento — vive em `@/lib/email`, e o aspecto em
  `@/lib/email-molde`, partilhados com os formulários do site. Aqui fica só o
  que é do painel: o que o email diz.
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

  const conteudo = {
    titulo: "Código de acesso ao painel",
    destaque: { valor: legivel, nota: "Vale 10 minutos e serve uma vez só." },
    nota: "Se não foi você a pedir, ignore este email. Sem o código não se entra.",
  };

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
    html: moldeHtml({ etiqueta: "Painel de gestão", ...conteudo }),
    texto: moldeTexto({
      ...conteudo,
      titulo: `O seu código de acesso ao painel do ${SITE_NAME}`,
    }),
    anexos: [anexoDoLogo],
  });
}
