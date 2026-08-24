import { z } from "zod";

/*
  A validação dos dados de uma viatura, partilhada pelo formulário e pela
  server action que grava. A mesma no cliente e no servidor — mas a que conta
  é a do servidor: a do cliente é conveniência, não fronteira.
*/

// Opções fechadas — usadas no zod (validação) e nos selects do formulário.
export const SEGMENTOS = [
  "Coupé",
  "SUV",
  "Carrinha",
  "Berlina",
  "Cabrio",
  "Citadino",
] as const;

export const COMBUSTIVEIS = [
  "Gasolina",
  "Diesel",
  "Híbrido",
  "Elétrico",
] as const;

export const TRANSMISSOES = ["Automática", "Manual"] as const;

export const ESTADOS_VENDA = [
  { valor: "disponivel", rotulo: "Disponível" },
  { valor: "reservado", rotulo: "Reservado" },
  { valor: "vendido", rotulo: "Vendido" },
] as const;

const extraSchema = z.object({
  categoria: z.string().trim().min(1, "Indique a categoria"),
  itens: z.array(z.string().trim().min(1)).default([]),
});

export const viaturaSchema = z.object({
  marca: z.string().trim().min(1, "Indique a marca"),
  modelo: z.string().trim().min(1, "Indique o modelo"),
  versao: z.string().trim().default(""),
  preco: z.coerce.number().int().min(0, "Preço inválido"),
  registoMes: z.coerce.number().int().min(1).max(12),
  registoAno: z.coerce.number().int().min(1950).max(2100),
  quilometros: z.coerce.number().int().min(0),
  lugares: z.coerce.number().int().min(1).max(9),
  portas: z.coerce.number().int().min(1).max(7),
  segmento: z.enum(SEGMENTOS),
  combustivel: z.enum(COMBUSTIVEIS),
  potenciaCv: z.coerce.number().int().min(0),
  cilindradaCc: z.coerce.number().int().min(0),
  transmissao: z.enum(TRANSMISSOES),
  cor: z.string().trim().default(""),
  corInterior: z.string().trim().default(""),
  origem: z.string().trim().default(""),
  estado: z.string().trim().default("Usado"),
  garantia: z.string().trim().default(""),
  livroRevisoes: z.boolean().default(false),
  segundaChave: z.boolean().default(false),
  classePortagem: z.string().trim().default(""),
  matricula: z.string().trim().default(""),
  vin: z.string().trim().default(""),
  fotos: z.array(z.string()).default([]),
  extras: z.array(extraSchema).default([]),
  destaque: z.boolean().default(false),
  estadoVenda: z.enum(["disponivel", "reservado", "vendido"]).default(
    "disponivel",
  ),
  ivaDedutivel: z.boolean().default(false),
  descricao: z.string().trim().default(""),
});

/*
  **Dois tipos, e a diferença importa.**

  Em zod v4 o `.default()` faz o campo ser opcional à *entrada* e obrigatório à
  *saída* — e o `z.infer` devolve o de **saída**. Usá-lo na assinatura da acção
  obrigaria o formulário a fornecer os 29 campos, incluindo os que existem
  precisamente para não ter de os preencher.

  Verificado: `viaturaSchema.parse({ …sem versao, sem estado… })` devolve
  `{ versao: "", estado: "Usado", estadoVenda: "disponivel", destaque: false }`.

  Nota de confiança: `z.coerce.number()` tem entrada `unknown`, portanto o
  `ViaturaInput` **não** protege contra tipos errados. A fronteira real é o
  `parse`, não o TypeScript — e é por isso que ele corre no servidor.
*/
export type ViaturaInput = z.input<typeof viaturaSchema>;
export type ViaturaValidada = z.output<typeof viaturaSchema>;
