import { formatarData, formatarKm, formatarPreco } from "@/lib/format";
import { INTENCOES, MESES, SIM_NAO, type TipoDePedido } from "@/lib/pedidos/schema";

/*
  O que um pedido diz, escrito uma vez para os dois canais.

  O email que chega ao stand e a mensagem que abre no WhatsApp são o mesmo
  texto, linha a linha, a partir da mesma lista de campos. Se um dia se
  acrescentar um campo ao formulário, acrescenta-se aqui e aparece nos dois.

  Trabalha sobre **texto cru** — o `Record<string, string>` que o formulário
  tem em estado — e não sobre o pedido validado, porque o WhatsApp é composto
  no browser antes de qualquer validação, com o que estiver preenchido.
  O servidor passa-lhe os mesmos valores depois de os validar.

  Sem `server-only`: corre no browser.
*/

export type Valores = Record<string, string>;

type Campo = {
  chave: string;
  rotulo: string;
  /** Como o valor se lê. Por omissão, tal e qual. */
  mostrar?: (valor: string, valores: Valores) => string;
  /** No WhatsApp um texto livre corta-se, para o URL não crescer sem limite. */
  cortarNoWhatsApp?: number;
};

type Seccao = { titulo: string; campos: Campo[] };

function rotuloDe<T extends readonly { valor: string; rotulo: string }[]>(
  lista: T,
  valor: string,
): string {
  return lista.find((o) => o.valor === valor)?.rotulo ?? valor;
}

function comoNumero(valor: string): number | null {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function km(valor: string): string {
  const n = comoNumero(valor);
  return n === null ? valor : formatarKm(n);
}

function euros(valor: string): string {
  const n = comoNumero(valor);
  return n === null ? valor : formatarPreco(n);
}

const MATRICULA_EM: Campo = {
  chave: "registoAno",
  rotulo: "Matrícula em",
  mostrar: (ano, v) => {
    const mes = comoNumero(v.registoMes ?? "");
    return mes && mes >= 1 && mes <= 12 ? `${MESES[mes - 1]} de ${ano}` : ano;
  },
};

const CONTACTO: Seccao = {
  titulo: "Contacto",
  campos: [
    { chave: "nome", rotulo: "Nome" },
    { chave: "telefone", rotulo: "Telefone" },
    { chave: "email", rotulo: "Email" },
  ],
};

export const SECCOES: Record<TipoDePedido, Seccao[]> = {
  compra: [
    {
      titulo: "Viatura",
      campos: [
        { chave: "matricula", rotulo: "Matrícula", mostrar: (m) => m.toUpperCase() },
        { chave: "marca", rotulo: "Marca" },
        { chave: "modelo", rotulo: "Modelo e versão" },
        MATRICULA_EM,
        { chave: "combustivel", rotulo: "Combustível" },
        { chave: "transmissao", rotulo: "Caixa" },
        { chave: "quilometros", rotulo: "Quilómetros", mostrar: km },
        { chave: "livroRevisoes", rotulo: "Livro de revisões", mostrar: (v) => rotuloDe(SIM_NAO, v) },
        { chave: "proprietarios", rotulo: "Proprietários" },
        { chave: "estado", rotulo: "Estado", cortarNoWhatsApp: 500 },
      ],
    },
    {
      titulo: "Intenção",
      campos: [{ chave: "intencao", rotulo: "Pretende", mostrar: (v) => rotuloDe(INTENCOES, v) }],
    },
    CONTACTO,
  ],
  importacao: [
    {
      titulo: "O que procura",
      campos: [
        { chave: "marca", rotulo: "Marca" },
        { chave: "modelo", rotulo: "Modelo e versão" },
        { chave: "anoMinimo", rotulo: "Ano mínimo" },
        { chave: "kmMaximos", rotulo: "Quilómetros máximos", mostrar: km },
        { chave: "combustivel", rotulo: "Combustível" },
        { chave: "transmissao", rotulo: "Caixa" },
        { chave: "cor", rotulo: "Cor" },
        { chave: "extras", rotulo: "Extras que não podem faltar", cortarNoWhatsApp: 500 },
      ],
    },
    {
      titulo: "Orçamento e prazo",
      campos: [
        { chave: "orcamento", rotulo: "Orçamento", mostrar: euros },
        { chave: "prazo", rotulo: "Prazo" },
      ],
    },
    CONTACTO,
  ],
};

export type Linhas = { titulo: string; linhas: [string, string][] }[];

/** As secções com o que está preenchido; as vazias ficam de fora. */
export function linhas(tipo: TipoDePedido, valores: Valores, whatsapp = false): Linhas {
  return SECCOES[tipo]
    .map((s) => ({
      titulo: s.titulo,
      linhas: s.campos.flatMap((c): [string, string][] => {
        const cru = (valores[c.chave] ?? "").trim();
        if (!cru) return [];
        let valor = c.mostrar ? c.mostrar(cru, valores) : cru;
        if (whatsapp && c.cortarNoWhatsApp && valor.length > c.cortarNoWhatsApp) {
          valor = `${valor.slice(0, c.cortarNoWhatsApp - 1)}…`;
        }
        return [[c.rotulo, valor]];
      }),
    }))
    .filter((s) => s.linhas.length > 0);
}

const ABERTURA: Record<TipoDePedido, string> = {
  compra: "Olá! Quero vender ou dar de retoma a minha viatura.",
  importacao: "Olá! Procuro uma viatura que não têm em stock.",
};

/*
  A mensagem que abre no WhatsApp. Com tudo em branco é só a saudação — o
  botão nunca está desactivado, porque quem prefere falar directamente não
  tem de preencher nada primeiro.
*/
export function textoWhatsApp(tipo: TipoDePedido, valores: Valores, fotos = 0): string {
  const blocos = linhas(tipo, valores, true).map((s) =>
    s.linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`).join("\n"),
  );
  const partes = [ABERTURA[tipo], ...blocos];
  if (fotos > 0) {
    partes.push(
      fotos === 1 ? "Envio a fotografia a seguir." : `Envio as ${fotos} fotografias a seguir.`,
    );
  }
  return partes.join("\n\n");
}

const TITULO: Record<TipoDePedido, string> = {
  compra: "Compramos",
  importacao: "Importamos",
};

/*
  O assunto diz o essencial sem abrir: o que é, que carro, quem. Numa caixa
  de entrada cheia é o que permite encontrar o pedido daqui a duas semanas.
  Sem quebras de linha — um `\n` num cabeçalho de email é uma porta para
  injectar outros cabeçalhos.
*/
export function assuntoEmail(tipo: TipoDePedido, valores: Valores): string {
  const carro = [valores.marca, valores.modelo]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const ano = tipo === "compra" ? (valores.registoAno ?? "").trim() : "";
  const partes = [TITULO[tipo], `${carro}${ano ? ` (${ano})` : ""}`, (valores.nome ?? "").trim()];
  return partes
    .filter(Boolean)
    .join(" — ")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 120);
}

export function textoEmail(
  tipo: TipoDePedido,
  valores: Valores,
  { fotos, quando }: { fotos: number; quando: Date },
): string {
  const cabecalho =
    tipo === "compra"
      ? "Pedido de avaliação enviado pelo site — Compramos o seu carro."
      : "Pedido de viatura por encomenda enviado pelo site — Importamos o seu carro.";

  const blocos = linhas(tipo, valores).map((s) =>
    [
      s.titulo.toUpperCase(),
      ...s.linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    ].join("\n"),
  );

  const rodape = [
    fotos > 0
      ? fotos === 1
        ? "Segue 1 fotografia em anexo."
        : `Seguem ${fotos} fotografias em anexo.`
      : "Sem fotografias.",
    `Recebido a ${formatarData(quando)}.`,
    "Responder a este email responde directamente a quem fez o pedido.",
  ].join("\n");

  return [cabecalho, ...blocos, rodape].join("\n\n");
}
