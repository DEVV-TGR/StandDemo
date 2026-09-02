import "server-only";
import { createHash } from "node:crypto";
import { enviarEmail, ErroAoEnviar } from "@/lib/email";
import { stand } from "@/data/stand";
import { assuntoEmail, textoEmail, type Valores } from "@/lib/pedidos/mensagem";
import { anotarEnvio, podeEnviar } from "@/lib/pedidos/limites";
import { prepararAnexos } from "@/lib/pedidos/anexos";
import { ErroDeFotos } from "@/lib/pedidos/fotos";
import { SCHEMAS, type TipoDePedido } from "@/lib/pedidos/schema";
import type { EstadoDoPedido } from "@/lib/pedidos/estado";
import { emPortugues } from "@/lib/tempo";

/*
  O que acontece quando alguém carrega em "Enviar pedido".

  O pedido segue por email para o stand, com `Reply-To` de quem o fez, e as
  fotografias em anexo. **Não é guardado em lado nenhum** — nem base de dados,
  nem armazenamento de ficheiros. É a diferença que a Política de Privacidade
  afirma, e a razão de este ficheiro não falar com o Neon nem com o R2.

  Quando os pedidos passarem a ficar no painel, é aqui que entra o `insert` —
  num sítio só, e com o email a continuar a sair, porque um registo que
  ninguém vê não avisa ninguém.

  ## A ordem dos passos não é arbitrária

  Cada passo protege o seguinte de trabalho inútil, e o mais barato vem
  primeiro. A validação vem depois do orçamento porque ler o `FormData` de
  seis fotografias custa mais do que olhar para um contador em memória — e
  vem antes de o gastar, para quem se enganou num campo não ficar sem
  tentativas por causa disso.
*/

/** O tempo mínimo que um humano leva a preencher isto. Um bot leva menos. */
const SEGUNDOS_MINIMOS = 4;

const RECORRER_AO_WHATSAPP =
  "Não conseguimos enviar o pedido neste momento. Fale connosco no WhatsApp ou " +
  "ligue-nos — o que escreveu fica aqui.";

/*
  A primeira coisa que falta, dita como se diz a uma pessoa.

  Uma lista com os oito campos em falta não ajuda ninguém: quem preencheu mal
  um campo corrige um campo. As mensagens vêm do schema, já em português.
*/
function primeiroErro(erros: { message: string }[]): string {
  return erros[0]?.message ?? "Confirme os dados e tente de novo.";
}

export async function enviarPedido(
  tipo: TipoDePedido,
  dados: FormData,
): Promise<EstadoDoPedido> {
  /*
    O campo que ninguém vê.

    Está fora do ecrã e sem `tabindex`; uma pessoa não lhe chega, e um
    preenchedor automático preenche-o. Quando vem preenchido responde-se
    **sucesso** — dizer que falhou é ensinar quem escreveu o script a
    contornar isto na tentativa seguinte.
  */
  if (String(dados.get("website") ?? "").trim() !== "") {
    return { enviado: true };
  }

  const iniciado = Number(dados.get("iniciadoEm"));
  const segundos = Number.isFinite(iniciado) ? (Date.now() - iniciado) / 1000 : -1;

  if (segundos < SEGUNDOS_MINIMOS) {
    return {
      erro: "O formulário foi enviado depressa de mais. Confirme os dados e envie de novo.",
    };
  }

  try {
    const orcamento = await podeEnviar();
    if (!orcamento.pode) {
      return {
        erro:
          `Já enviou pedidos a mais. Pode tentar de novo daqui a ${emPortugues(orcamento.esperarSegundos)}` +
          " — ou fale connosco já no WhatsApp.",
        esperar: orcamento.esperarSegundos,
      };
    }

    const bruto = Object.fromEntries(
      [...dados.entries()].filter(([, v]) => typeof v === "string"),
    ) as Valores;

    const veredicto = SCHEMAS[tipo].safeParse(bruto);
    if (!veredicto.success) return { erro: primeiroErro(veredicto.error.issues) };

    const anexos = await prepararAnexos(dados.getAll("fotos"));
    const quando = new Date();
    const texto = textoEmail(tipo, bruto, { fotos: anexos.length, quando });

    await enviarEmail({
      /*
        O destino é o email do stand. O `PEDIDOS_DESTINO` existe para testar
        sem disparar emails para a caixa do cliente — em produção não está
        definido.
      */
      para: process.env.PEDIDOS_DESTINO || stand.email,
      responderA: veredicto.data.email,
      assunto: assuntoEmail(tipo, bruto),
      texto,
      /* Dois cliques no mesmo pedido dão um email só. */
      chaveIdempotencia: `pedido-${createHash("sha256")
        .update(`${tipo}|${veredicto.data.email}|${texto}`)
        .digest("hex")
        .slice(0, 32)}`,
      anexos,
    });

    await anotarEnvio();
  } catch (erro) {
    /* O que é do formulário diz-se; o resto encaminha-se para o WhatsApp. */
    if (erro instanceof ErroDeFotos) return { erro: erro.message };

    if (erro instanceof ErroAoEnviar) {
      console.error(`[pedidos] falha ao enviar (${tipo}):`, erro.message);
      return { erro: RECORRER_AO_WHATSAPP };
    }

    console.error(`[pedidos] falha inesperada (${tipo}):`, erro);
    return { erro: RECORRER_AO_WHATSAPP };
  }

  return { enviado: true };
}
