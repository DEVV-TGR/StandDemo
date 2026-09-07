"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { stand } from "@/data/stand";
import { Aviso, CampoConsentimento, Sucesso } from "@/components/ui/campos";
import { CamposAntiSpam } from "@/components/pedidos/CamposAntiSpam";
import { PEDIDO_INICIAL, type EstadoDoPedido } from "@/lib/pedidos/estado";
import { textoWhatsApp, type Valores } from "@/lib/pedidos/mensagem";
import { SCHEMAS, type TipoDePedido } from "@/lib/pedidos/schema";

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

  ## A validação é a do servidor, corrida no browser

  O mesmo `SCHEMAS[tipo]` que o servidor usa é aplicado aqui a cada tecla.
  Não é uma segunda validação escrita à mão — é a mesma, e por isso não pode
  divergir e dizer que serve o que o servidor recusa, ou o contrário.

  **Quando se mostra** é a parte que interessa a quem preenche: nada aparece
  enquanto se escreve pela primeira vez; a frase surge ao sair do campo, e
  desaparece assim que o valor passa a servir. Carregar em «Enviar» dá por
  visitados todos os campos de uma vez, que é o que faz aparecer o que ficou
  esquecido lá em cima. E se houver alguma coisa por corrigir, o envio nem
  sai do browser: leva o foco ao primeiro campo com problema em vez de
  gastar uma ida ao servidor para trazer de volta a mesma frase.

  ## O relógio anti-robô

  O momento em que a página ficou pronta vive numa referência e é escrito no
  `FormData` no instante do envio. Esteve num `<input>` escondido e não podia
  ficar: o reset que o React faz ao `<form>` depois da acção apagava-o, e a
  segunda tentativa de quem se enganou era recusada com "enviado depressa de
  mais" — para sempre, até recarregar a página.

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

/** As quatro propriedades que um campo recebe do formulário que o contém. */
export type PropriedadesDoCampo = {
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string;
  aoSair: () => void;
};

export type Ajuda = {
  /** Tudo o que um campo precisa, pela chave do schema: `{...campo("marca")}`. */
  campo: (chave: string) => PropriedadesDoCampo;
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
  const [visitados, setVisitados] = useState<Record<string, boolean>>({});
  const [tentou, setTentou] = useState(false);
  const [tentativas, setTentativas] = useState(0);

  const forma = useRef<HTMLFormElement>(null);
  /* Qual o campo a receber o foco na tentativa que o contador acabou de contar. */
  const porCorrigir = useRef<string | null>(null);
  const caixaDeErro = useRef<HTMLDivElement>(null);
  const caixaDeSucesso = useRef<HTMLDivElement>(null);

  /* O relógio anti-robô: fora do DOM, portanto fora do alcance do reset. */
  const iniciadoEm = useRef(0);
  useEffect(() => {
    iniciadoEm.current = Date.now();
  }, []);

  const mudar = (chave: string) => (valor: string) =>
    setValores((v) => ({ ...v, [chave]: valor }));

  /*
    O schema do servidor, corrido sobre o que está preenchido. Os campos que
    ainda não foram tocados entram como `""` e não em falta: é o que faz o
    zod responder "Indique a marca" em vez da frase que ele escreve sozinho
    para um campo ausente, que ninguém quer ler.
  */
  const esquema = SCHEMAS[tipo];
  const chaves = Object.keys(esquema.shape);

  const paraValidar: Record<string, string> = {};
  for (const chave of chaves) paraValidar[chave] = valores[chave] ?? "";
  paraValidar.consentimento = aceita ? "on" : "";

  const veredicto = esquema.safeParse(paraValidar);
  const erros: Record<string, string> = {};
  if (!veredicto.success) {
    for (const problema of veredicto.error.issues) {
      const chave = String(problema.path[0] ?? "");
      if (chave && !erros[chave]) erros[chave] = problema.message;
    }
  }

  const visivel = (chave: string) =>
    visitados[chave] || tentou ? erros[chave] : undefined;

  const campo = (chave: string): PropriedadesDoCampo => ({
    valor: valores[chave] ?? "",
    aoMudar: mudar(chave),
    erro: visivel(chave),
    aoSair: () => setVisitados((v) => (v[chave] ? v : { ...v, [chave]: true })),
  });

  /*
    O foco segue o que mudou. Sem isto, quem usa leitor de ecrã submete e
    fica no botão, sem saber que apareceu uma mensagem por cima — e quem vê
    o ecrã num telemóvel pode ter a mensagem fora da vista.
  */
  useEffect(() => {
    if (estado.enviado) caixaDeSucesso.current?.focus();
    else if (estado.erro) caixaDeErro.current?.focus();
  }, [estado]);

  /*
    Levar o ecrã ao primeiro campo por corrigir.

    Duas escolhas, e nenhuma é gosto pessoal.

    **Num efeito**, porque as frases de erro mudam a altura de meia página: um
    `focus()` pedido no mesmo instante em que se carrega no botão rola para
    onde o campo *estava*. O efeito corre com o DOM já actualizado.

    **Sem rolagem suave**, ao contrário do resto do site. Apareceu texto acima
    da vista, e o browser vai reajustar a posição sozinho para compensar —
    esse reajuste cancela uma animação de rolagem a meio e deixa a pessoa onde
    estava, a olhar para um botão que aparentemente não fez nada. Um salto não
    se cancela.
  */
  useEffect(() => {
    const chave = porCorrigir.current;
    porCorrigir.current = null;
    if (!chave) return;

    const alvo = forma.current?.elements.namedItem(chave);
    const primeiro = alvo instanceof RadioNodeList ? alvo.item(0) : alvo;
    if (!(primeiro instanceof HTMLElement)) return;

    primeiro.focus({ preventScroll: true });
    primeiro.scrollIntoView({ block: "center", behavior: "instant" });
  }, [tentativas]);

  /*
    Travar um envio incompleto **antes** da acção, e não lá dentro.

    Parece a mesma coisa e não é. Uma acção que corre e desiste continua a ser
    uma acção corrida para o React, que a seguir faz reset ao `<form>` — e o
    reset limpa o que está no DOM. O estado mantém os valores, mas enquanto
    não houver novo render ninguém os repõe: a pessoa carregava em «Enviar»,
    tinha um campo mal preenchido, e via o formulário inteiro esvaziar-se.

    Com o `preventDefault` a acção nem chega a ser chamada, e não há reset.
  */
  const aoSubmeter = (evento: React.FormEvent<HTMLFormElement>) => {
    setTentou(true);

    const falhado = chaves.find((chave) => erros[chave]);
    if (!falhado) return;

    evento.preventDefault();
    porCorrigir.current = falhado;
    setTentativas((n) => n + 1);
  };

  const enviar = (dados: FormData) => {
    dados.set("iniciadoEm", String(iniciadoEm.current));
    submeter(dados);
  };

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
    <form
      ref={forma}
      action={enviar}
      onSubmit={aoSubmeter}
      noValidate
      className="relative space-y-10"
    >
      <CamposAntiSpam />

      {children({ campo, desativado: aEnviar, aoMudarFotos: setFotos })}

      <div className="space-y-4">
        <CampoConsentimento
          nome="consentimento"
          marcado={aceita}
          aoMudar={setAceita}
          desativado={aEnviar}
          erro={visivel("consentimento")}
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
