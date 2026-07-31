import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { ExtrasCategoria } from "@/lib/types";

// Tabela de viaturas — espelha o tipo `Viatura` (src/lib/types.ts).
// `extras` e `fotos` ficam como jsonb; o resto são colunas tipadas.
export const viaturas = pgTable("viaturas", {
  id: text("id").primaryKey(),
  marca: text("marca").notNull(),
  marcaSlug: text("marca_slug").notNull(),
  modelo: text("modelo").notNull(),
  modeloSlug: text("modelo_slug").notNull(),
  versao: text("versao").notNull().default(""),
  preco: integer("preco").notNull(),
  registoMes: integer("registo_mes").notNull(),
  registoAno: integer("registo_ano").notNull(),
  quilometros: integer("quilometros").notNull(),
  lugares: integer("lugares").notNull(),
  portas: integer("portas").notNull(),
  segmento: text("segmento").notNull(),
  combustivel: text("combustivel").notNull(),
  potenciaCv: integer("potencia_cv").notNull(),
  cilindradaCc: integer("cilindrada_cc").notNull(),
  transmissao: text("transmissao").notNull(),
  cor: text("cor").notNull().default(""),
  corInterior: text("cor_interior").notNull().default(""),
  origem: text("origem").notNull().default(""),
  estado: text("estado").notNull().default("Usado"),
  garantia: text("garantia").notNull().default(""),
  livroRevisoes: boolean("livro_revisoes").notNull().default(false),
  segundaChave: boolean("segunda_chave").notNull().default(false),
  classePortagem: text("classe_portagem").notNull().default(""),
  matricula: text("matricula").notNull().default(""),
  vin: text("vin").notNull().default(""),
  fotos: jsonb("fotos").$type<string[]>().notNull().default([]),
  extras: jsonb("extras").$type<ExtrasCategoria[]>().notNull().default([]),
  destaque: boolean("destaque").notNull().default(false),
  estadoVenda: text("estado_venda").notNull().default("disponivel"),
  ivaDedutivel: boolean("iva_dedutivel").notNull().default(false),
  descricao: text("descricao").notNull().default(""),
  // ordenação estável na listagem admin (mais recente primeiro)
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Utilizadores com acesso ao painel /admin.
export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nome: text("nome").notNull().default(""),
  criadoEm: timestamp("criado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ViaturaRow = typeof viaturas.$inferSelect;
export type ViaturaInsert = typeof viaturas.$inferInsert;
export type AdminUserRow = typeof adminUsers.$inferSelect;
