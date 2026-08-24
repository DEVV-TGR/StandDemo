"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { autorizado } from "@/lib/painel/utilizadores";
import {
  selar,
  lembrarAparelho,
  aparelhoConhecido,
  esquecerAparelho,
  opcoesDoCookie,
  NOME_DO_COOKIE,
  NOME_DO_APARELHO,
  VALIDADE_APARELHO_MS,
} from "@/lib/painel/sessao";
import {
  gerarCodigo,
  criarDesafio,
  conferirCodigo,
  emailDoDesafio,
  apagarDesafio,
  NOME_DO_DESAFIO,
  VALIDADE_MS as VALIDADE_DO_DESAFIO,
} from "@/lib/painel/codigo";
import { enviarCodigo, ErroAoEnviar } from "@/lib/painel/email";
import { podePedirCodigo, anotar } from "@/lib/painel/limites";
import { exigirSessaoNaAccao } from "@/lib/painel/porta";

/*
  Entrar, confirmar o código, e sair.

  A entrada é passwordless: escreve-se o email, chega um código, entra-se. Um
  aparelho que já tenha passado pelo código salta-o durante 30 dias.
*/

export type EstadoDaEntrada = { erro?: string; enviado?: boolean };

/*
  A resposta é sempre a mesma, e é o ponto mais delicado deste ficheiro.

  Um email que tem acesso e um que não tem saem daqui com `{ enviado: true }`,
  e o ecrã escreve a mesma frase nos dois casos. Se a resposta distinguisse —
  *"esse email não está autorizado"* — o formulário passava a ser uma
  ferramenta para qualquer pessoa descobrir quem entra no painel.

  E não é só o texto. Um email de fora **consome na mesma** o orçamento de
  pedidos, para o comportamento a partir do quarto ser igual nos dois casos.
*/
export async function pedirCodigo(
  _estado: EstadoDaEntrada,
  dados: FormData,
): Promise<EstadoDaEntrada> {
  const email = String(dados.get("email") ?? "").trim().toLowerCase();

  if (!email.includes("@")) return { erro: "Escreva um endereço de email." };

  const frasco = await cookies();
  let jaConhecido = false;
  let desafioCriado = false;

  /*
    Tudo o que fala com a base ou com o Resend vive aqui dentro.

    O `redirect` **não** — fica de fora, no fim. Funciona atirando uma excepção
    que o Next apanha, e um `catch` à volta seria uma forma silenciosa de a
    engolir. Por isso o que se decide cá dentro é um booleano, e o salto dá-se
    lá em baixo.
  */
  try {
    /*
      **O aparelho conhecido é verificado primeiro, e não consome orçamento.**

      A ordem inversa — contar antes de tudo — é a que faz sentido para a
      verificação da lista, e é por isso que ela vem a seguir: quem esteja a
      sondar endereços não pode perceber pelo comportamento quais os que têm
      acesso. Mas aplicá-la também ao aparelho lembrado era um erro com
      consequência prática séria: entrar pelo caminho rápido, que **não envia
      email nenhum**, gastava na mesma o orçamento de envios. Ao fim de três
      entradas a pessoa ficava fechada quinze minutos sem o sistema ter
      mandado um único email — e, pior, sem forma de sair do impasse, porque
      esquecer o aparelho deixava-a a precisar de um código que já não podia
      pedir.

      Verificar aqui não abre porta nenhuma: o aparelho exige um cookie
      assinado por nós, que só existe em quem já entrou pelo menos uma vez.
      Não é via de enumeração.
    */
    const quem = autorizado(email);

    if (quem && (await aparelhoConhecido(frasco.get(NOME_DO_APARELHO)?.value, quem.email))) {
      frasco.set(NOME_DO_COOKIE, await selar(quem.email), opcoesDoCookie());
      jaConhecido = true;
    } else {
      /*
        Daqui para baixo é que se conta — e conta-se **antes** de saber se o
        email existe. Esgotado o orçamento, responde-se a mesma coisa de
        sempre: quem sonda não fica a saber se parou por causa do limite ou
        por o endereço não existir.
      */
      if (!(await podePedirCodigo(email))) {
        await anotar("limite de pedidos esgotado", email);
        return { enviado: true };
      }

      if (!quem) {
        await anotar("pedido para email fora da lista", email);
        return { enviado: true };
      }

      /* Pedir outro código invalida o anterior, para não haver dois válidos. */
      await apagarDesafio(frasco.get(NOME_DO_DESAFIO)?.value);

      const codigo = gerarCodigo();
      await enviarCodigo({ para: quem.email, codigo });

      frasco.set(
        NOME_DO_DESAFIO,
        await criarDesafio(quem.email, codigo),
        opcoesDoCookie(VALIDADE_DO_DESAFIO),
      );
      desafioCriado = true;
    }
  } catch (erro) {
    /* Uma falha de envio nunca pode virar "entra à mesma". */
    if (erro instanceof ErroAoEnviar) return { erro: erro.paraOEcra };

    /*
      Sem base não se conta, e sem contar não se deixa entrar — mas isso tem de
      ser **dito**, não atirado. Sem este ramo, o que aparecia era o ecrã de
      avaria da Vercel, em inglês e com um número de oito algarismos.
    */
    console.error("[painel] falha ao pedir código:", erro);
    return {
      erro:
        "O painel não está a conseguir falar com a base de dados e por isso não " +
        "deixa entrar ninguém. Não é do seu email. Contacte o suporte.",
    };
  }

  if (jaConhecido) redirect("/admin");
  if (desafioCriado) redirect("/admin/entrar/codigo");

  /*
    Chega-se aqui quando não se criou desafio nenhum: o email não está na lista,
    ou o orçamento de pedidos esgotou-se. Nos dois casos a resposta é a mesma,
    e o ecrã escreve a mesma frase — é isso que impede o formulário de se
    tornar uma ferramenta para descobrir quem tem acesso.

    **O que não pode acontecer é ficar em silêncio.** Antes, um `redirect` para
    o ecrã do código dava com um desvio de volta para aqui, porque não havia
    desafio — e o que a pessoa via era um botão que não fazia nada. Para quem
    tem acesso legítimo e apenas esbarrou no limite, isso é indistinguível de
    uma avaria.
  */
  return { enviado: true };
}

export type EstadoDoCodigo = { erro?: string; reenviado?: boolean };

export async function confirmarCodigo(
  _estado: EstadoDoCodigo,
  dados: FormData,
): Promise<EstadoDoCodigo> {
  const frasco = await cookies();
  const escrito = String(dados.get("codigo") ?? "");

  /* Mesma forma do `pedirCodigo`: a base dentro, o `redirect` fora. */
  try {
    const veredicto = await conferirCodigo(frasco.get(NOME_DO_DESAFIO)?.value, escrito);

    if (veredicto.estado === "sem-desafio" || veredicto.estado === "expirado") {
      frasco.delete({ name: NOME_DO_DESAFIO, path: "/admin" });
      return { erro: "O código expirou ou já não serve. Peça outro." };
    }

    if (veredicto.estado === "errado") {
      await anotar("código errado", "—");
      return {
        erro:
          veredicto.restam > 0
            ? `Código errado. ${veredicto.restam === 1 ? "Falta 1 tentativa" : `Faltam ${veredicto.restam} tentativas`}.`
            : "Código errado, e acabaram as tentativas. Peça outro.",
      };
    }

    frasco.set(NOME_DO_COOKIE, await selar(veredicto.email), opcoesDoCookie());
    frasco.set(
      NOME_DO_APARELHO,
      await lembrarAparelho(veredicto.email),
      opcoesDoCookie(VALIDADE_APARELHO_MS),
    );
    frasco.delete({ name: NOME_DO_DESAFIO, path: "/admin" });
  } catch (erro) {
    /*
      O contador de tentativas vive na base. Sem ela não se consegue conferir o
      código — e **não conseguir conferir nunca pode virar "entra à mesma"**.
      Falha fechado, com uma frase que se lê.
    */
    console.error("[painel] falha ao confirmar código:", erro);
    return {
      erro:
        "O painel não está a conseguir falar com a base de dados. Não é do " +
        "código que escreveu. Tente daqui a pouco.",
    };
  }

  redirect("/admin");
}

/** "Não chegou nada" — outro código, e o anterior deixa de servir. */
export async function reenviarCodigo(): Promise<EstadoDoCodigo> {
  const frasco = await cookies();

  try {
    const email = await emailDoDesafio(frasco.get(NOME_DO_DESAFIO)?.value);

    if (!email) return { erro: "O código expirou. Volte a escrever o email." };

    /* O reenvio conta como pedido — senão era a porta das traseiras do limite. */
    if (!(await podePedirCodigo(email))) {
      await anotar("limite esgotado no reenvio", email);
      return { erro: "Já pediu códigos demais. Espere uns minutos." };
    }

    await apagarDesafio(frasco.get(NOME_DO_DESAFIO)?.value);
    const codigo = gerarCodigo();

    await enviarCodigo({ para: email, codigo });

    frasco.set(
      NOME_DO_DESAFIO,
      await criarDesafio(email, codigo),
      opcoesDoCookie(VALIDADE_DO_DESAFIO),
    );
  } catch (erro) {
    if (erro instanceof ErroAoEnviar) return { erro: erro.paraOEcra };
    console.error("[painel] falha ao reenviar código:", erro);
    return { erro: "Não foi possível enviar outro código. Tente daqui a pouco." };
  }

  return { reenviado: true };
}

export async function sair(): Promise<void> {
  await exigirSessaoNaAccao();

  /*
    O `delete` tem de levar o mesmo caminho com que o cookie foi posto. Sem
    `path`, apagava um cookie de `/` que não existe e deixava o de `/admin` no
    sítio, com a sessão viva e o botão a não fazer nada.

    O aparelho **fica**: sair é fechar a sessão, não desconfiar do telemóvel.
    Quem quiser esquecê-lo tem o botão do lado.
  */
  (await cookies()).delete({ name: NOME_DO_COOKIE, path: "/admin" });

  redirect("/admin/entrar");
}

/*
  Esquecer este aparelho.

  Apaga o registo na base, o cookie do aparelho e a sessão — a seguir a isto,
  este browser volta a pedir o código. É o que se carrega quando se empresta o
  telemóvel, ou quando se entrou num computador que não é nosso.
*/
export async function esquecerEsteAparelho(): Promise<void> {
  await exigirSessaoNaAccao();
  const frasco = await cookies();

  await esquecerAparelho(frasco.get(NOME_DO_APARELHO)?.value);
  frasco.delete({ name: NOME_DO_APARELHO, path: "/admin" });
  frasco.delete({ name: NOME_DO_COOKIE, path: "/admin" });

  redirect("/admin/entrar");
}
