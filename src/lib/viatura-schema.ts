import { z } from "zod";

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

export type ViaturaInput = z.infer<typeof viaturaSchema>;
