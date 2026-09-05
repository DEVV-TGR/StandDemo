import { z } from "zod";
import { COMBUSTIVEIS, TRANSMISSOES } from "@/lib/viatura-schema";

/*
  A validação dos dois pedidos que o site aceita: vender ou dar de retoma uma
  viatura (`/compramos`) e procurar uma por encomenda (`/importamos`).

  Tudo chega de um `FormData`, portanto tudo entra como texto — os números
  passam por `z.coerce`, e um campo opcional deixado em branco é `""`, que se
  converte em `undefined` antes de o zod olhar para ele.

  Este ficheiro **não** tem `server-only`, de propósito: as listas fechadas
  alimentam os selects no browser, e é a mesma lista que o servidor exige.
  A validação que conta é a do servidor; a do browser é conveniência.

  Quando os pedidos passarem a ficar guardados no painel, o que sai daqui é o
  que vai para a coluna de dados — por isso as chaves são estáveis e em
  português, como as da viatura.
*/

export const INTENCOES = [
  { valor: "venda", rotulo: "Venda directa" },
  { valor: "retoma", rotulo: "Retoma na compra de outra viatura" },
] as const;

export const PRAZOS = [
  "O mais depressa possível",
  "1 a 3 meses",
  "3 a 6 meses",
  "Sem pressa",
] as const;

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const SIM_NAO = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
] as const;

const ANO_ACTUAL = new Date().getFullYear();

/* `""` → `undefined`, para o `.optional()` a seguir aceitar o campo em branco. */
function emBranco(valor: unknown): unknown {
  return typeof valor === "string" && valor.trim() === "" ? undefined : valor;
}

function numeroOpcional(min: number, max: number, mensagem: string) {
  return z.preprocess(
    emBranco,
    z.coerce.number({ error: mensagem }).int(mensagem).min(min, mensagem).max(max, mensagem).optional(),
  );
}

function textoOpcional(max: number) {
  return z.string().trim().max(max, `No máximo ${max} caracteres`).default("");
}

function enumOpcional<const T extends readonly [string, ...string[]]>(valores: T) {
  return z.preprocess(emBranco, z.enum(valores).optional());
}

/*
  O telefone aceita o que as pessoas escrevem — com espaços, com `+351`, sem
  ele. Nove a dezasseis algarismos, e nada mais: é o suficiente para apanhar
  um campo vazio ou um email posto no sítio errado, sem recusar um número
  estrangeiro.
*/
const telefone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s]{9,16}$/, "Indique um número de telefone");

const quemPede = {
  nome: z.string().trim().min(2, "Indique o seu nome").max(80, "Nome demasiado longo"),
  telefone,
  email: z.email("Indique um email válido").max(120),
  /*
    A checkbox só vai no `FormData` quando está marcada, e vai como `"on"`.
    Desmarcada não vai — o zod vê `null` e responde com esta frase.
  */
  consentimento: z.literal("on", { error: "Tem de aceitar a Política de Privacidade" }),
};

export const pedidoCompraSchema = z.object({
  matricula: z
    .string()
    .trim()
    .min(4, "Indique a matrícula")
    .max(12, "Matrícula demasiado longa")
    .transform((m) => m.toUpperCase()),
  marca: z.string().trim().min(1, "Indique a marca").max(60),
  modelo: z.string().trim().min(1, "Indique o modelo").max(120),
  registoMes: z.coerce
    .number({ error: "Indique o mês da matrícula" })
    .int()
    .min(1, "Indique o mês da matrícula")
    .max(12, "Indique o mês da matrícula"),
  registoAno: z.coerce
    .number({ error: "Indique o ano da matrícula" })
    .int("Indique o ano da matrícula")
    .min(1950, "Indique o ano da matrícula")
    .max(ANO_ACTUAL + 1, "Indique o ano da matrícula"),
  combustivel: z.enum(COMBUSTIVEIS, { error: "Indique o combustível" }),
  transmissao: z.enum(TRANSMISSOES, { error: "Indique a caixa" }),
  quilometros: z.coerce
    .number({ error: "Indique os quilómetros" })
    .int("Indique os quilómetros")
    .min(0, "Indique os quilómetros")
    .max(2_000_000, "Quilómetros fora do razoável"),
  estado: textoOpcional(2000),
  livroRevisoes: enumOpcional(["sim", "nao"]),
  proprietarios: numeroOpcional(1, 20, "Número de proprietários fora do razoável"),
  intencao: z.enum(["venda", "retoma"], { error: "Diga se é venda directa ou retoma" }),
  ...quemPede,
});

export const pedidoImportacaoSchema = z.object({
  marca: z.string().trim().min(1, "Indique a marca").max(60),
  modelo: z.string().trim().min(1, "Indique o modelo").max(120),
  anoMinimo: z.coerce
    .number({ error: "Indique o ano mínimo" })
    .int("Indique o ano mínimo")
    .min(1990, "Indique o ano mínimo")
    .max(ANO_ACTUAL + 1, "Indique o ano mínimo"),
  kmMaximos: numeroOpcional(0, 2_000_000, "Quilómetros fora do razoável"),
  combustivel: enumOpcional(COMBUSTIVEIS),
  transmissao: enumOpcional(TRANSMISSOES),
  cor: textoOpcional(60),
  extras: textoOpcional(2000),
  orcamento: z.coerce
    .number({ error: "Indique o orçamento" })
    .int("Indique o orçamento")
    .min(1000, "Indique o orçamento, em euros")
    .max(10_000_000, "Orçamento fora do razoável"),
  prazo: z.enum(PRAZOS, { error: "Indique o prazo" }),
  ...quemPede,
});

export type PedidoCompra = z.output<typeof pedidoCompraSchema>;
export type PedidoImportacao = z.output<typeof pedidoImportacaoSchema>;

export type TipoDePedido = "compra" | "importacao";

export const SCHEMAS = {
  compra: pedidoCompraSchema,
  importacao: pedidoImportacaoSchema,
} as const;
