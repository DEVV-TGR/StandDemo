"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { stand } from "@/data/stand";
import { Aviso, CampoConsentimento, Sucesso } from "@/components/ui/campos";
import { CamposAntiSpam } from "@/components/pedidos/CamposAntiSpam";
import { PEDIDO_INICIAL, type EstadoDoPedido } from "@/lib/pedidos/estado";
import { textoWhatsApp, type Valores } from "@/lib/pedidos/mensagem";
import type { TipoDePedido } from "@/lib/pedidos/schema";

/*
  O que os dois formulários têm em comum: tudo menos os campos.

  ## Os valores vivem em estado, e não é preferência

  Depois de uma server action, o React 19 faz reset ao `<form>`. Num
  formulário de dezasseis campos preenchido no telemóvel, um erro de
  validação apagava tudo — e a segunda tentativa começava do zero. Com os
  valores em estado, o que a pessoa escreveu fica onde estava.

  É também o que permite ao botão do WhatsApp levar a mesma informação: a
  mensagem é composta a partir dos mesmos valores, no browser, sem esperar
  por nada.

  ## Dois botões, e nenhum é o segundo prémio

  Há quem prefira escrever e quem prefira falar. O formulário envia por
  email; o WhatsApp abre a conversa com o que já está preenchido. Quem só
  quer falar carrega no segundo sem preencher nada — a mensagem sai na
  mesma, com a frase de abertura.
*/

/*
  Um bloco de campos, com o título na assinatura da casa: última palavra em
  itálico dourado. `<fieldset>`/`<legend>` a sério — é o que diz a um leitor
  de ecrã que estes seis campos são o mesmo assunto.
*/
export function Bloco({
  titulo,
  gold,
  children,
}: {
  titulo: string;
  gold: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-display h-sub text-ink">
        {titulo} <span className="italic text-gold">{gold}</span>
      </legend>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export type Ajuda = {
  valores: Valores;
  mudar: (chave: string) => (valor: string) => void;
  desativado: boolean;
  /** O campo das fotografias diz quantas são; a mensagem do WhatsApp menciona-as. */
  aoMudarFotos: (quantas: number) => void;
};

export function FormularioPedido({
  tipo,
  accao,
  sucesso,
  children,
}: {
  tipo: TipoDePedido;
  accao: (estado: EstadoDoPedido, dados: FormData) => Promise<EstadoDoPedido>;
  sucesso: { titulo: ReactNode; texto: string };
  children: (ajuda: Ajuda) => ReactNode;
}) {
  const [estado, submeter, aEnviar] = useActionState(accao, PEDIDO_INICIAL);
  const [valores, setValores] = useState<Valores>({});
  const [aceita, setAceita] = useState(false);
  const [fotos, setFotos] = useState(0);

  const caixaDeErro = useRef<HTMLDivElement>(null);
  const caixaDeSucesso = useRef<HTMLDivElement>(null);

  const mudar = (chave: string) => (valor: string) =>
    setValores((v) => ({ ...v, [chave]: valor }));

  /*
    O foco segue o que mudou. Sem isto, quem usa leitor de ecrã submete e
    fica no botão, sem saber que apareceu uma mensagem por cima — e quem vê
    o ecrã num telemóvel pode ter a mensagem fora da vista.
  */
  useEffect(() => {
    if (estado.enviado) caixaDeSucesso.current?.focus();
    else if (estado.erro) caixaDeErro.current?.focus();
  }, [estado]);

  const paraOWhatsApp = `${stand.whatsapp}?text=${encodeURIComponent(
    textoWhatsApp(tipo, valores, fotos),
  )}`;

  const botaoWhatsApp = (
    <a
      href={paraOWhatsApp}
      target="_blank"
      rel="noreferrer"
      className="press inline-flex items-center justify-center rounded-full border border-gold/40 px-6 py-3 text-center text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright"
    >
      Falar no WhatsApp
    </a>
  );

  if (estado.enviado) {
    return (
      <Sucesso ref={caixaDeSucesso}>
        <h2 className="font-display h-sub text-ink">{sucesso.titulo}</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{sucesso.texto}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {botaoWhatsApp}
          <button
            type="button"
            onClick={() => {
              setValores({});
              setAceita(false);
              setFotos(0);
              /*
                Recarrega a rota para o `useActionState` voltar ao princípio.
                Guardar o estado num `key` seria mais barato, mas deixava o
                formulário meio preenchido de fantasmas do envio anterior.
              */
              window.location.reload();
            }}
            className="press inline-flex items-center justify-center rounded-full px-6 py-3 text-sm tracking-wide text-muted hover:text-gold-bright"
          >
            Enviar outro pedido
          </button>
        </div>
      </Sucesso>
    );
  }

  return (
    <form action={submeter} className="relative space-y-10">
      <CamposAntiSpam />

      {children({ valores, mudar, desativado: aEnviar, aoMudarFotos: setFotos })}

      <div className="space-y-4">
        <CampoConsentimento
          nome="consentimento"
          marcado={aceita}
          aoMudar={setAceita}
          desativado={aEnviar}
        >
          Autorizo o {stand.nome} a usar estes dados para responder ao meu pedido,
          nos termos da{" "}
          <Link href="/privacidade" className="text-champagne underline-offset-4 hover:text-gold-bright hover:underline">
            Política de Privacidade
          </Link>
          .
        </CampoConsentimento>

        {estado.erro && <Aviso ref={caixaDeErro}>{estado.erro}</Aviso>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={aEnviar}
            className="gold-metal-fill press w-full rounded-full px-6 py-3 text-sm font-medium text-background disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {aEnviar ? "A enviar…" : "Enviar pedido"}
          </button>
          {botaoWhatsApp}
        </div>

        <p className="text-xs leading-relaxed text-muted">
          O pedido segue por email para o stand. Não fica guardado no site.
        </p>
      </div>
    </form>
  );
}
