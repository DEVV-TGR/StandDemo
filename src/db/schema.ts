import {
  boolean,
  index,
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

/*
  Os códigos de acesso ao painel.

  **Não há tabela de utilizadores.** Quem pode entrar é a lista de emails em
  `PAINEL_EMAILS`, e o acesso é passwordless — ver `docs/admin/03`. O `#12`
  tinha uma `admin_users` com `password_hash`; sai, e com ela sai o `bcrypt`.

  O código **nunca é guardado em texto**. Se o armazenamento for lido por quem
  não devia, os códigos activos não servem para entrar. `SHA-256` chega, e
  `bcrypt` seria lentidão sem ganho: o código expira em dez minutos, tem cinco
  tentativas, e para chegar ao hash é preciso já ter as credenciais da base —
  altura em que o código de entrada é o menor dos problemas.
*/
export const codigosAcesso = pgTable(
  "codigos_acesso",
  {
    /* Vai no cookie assinado do desafio. Sem o assinar, alguém pedia um código
       para o seu endereço e trocava o id pelo de outra pessoa. */
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    codigoHash: text("codigo_hash").notNull(),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    /* Uso único: preenchido ao ser aceite. Um código que já entrou não volta a
       entrar, mesmo dentro da validade — o que interessa se o email for lido
       mais tarde por outra pessoa. */
    consumidoEm: timestamp("consumido_em", { withTimezone: true }),
    tentativas: integer("tentativas").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /* Emitir um código novo invalida os anteriores da mesma conta, e a limpeza
       dos expirados corre na mesma passagem. As duas operações filtram por
       email. */
    index("codigos_acesso_email_idx").on(t.email),
    index("codigos_acesso_expira_idx").on(t.expiraEm),
  ],
);

/*
  Os limites de pedidos.

  Sem password, isto deixou de ser defesa em profundidade e passou a ser **a**
  defesa. Um código de seis algarismos são um milhão de hipóteses; sem limites,
  um script testa-as numa tarde.

  Uma linha por ocorrência, e o limite verifica-se contando as que caem dentro
  da janela. Poderia ser um contador com TTL — é o que o Taskuinha faz em Redis
  — mas aqui já há Postgres e um quarto serviço não se justifica. O preço é uma
  limpeza periódica das linhas velhas, feita na mesma passagem que limpa os
  códigos expirados.

  O limite de tentativas por código **não vive aqui**: vive na coluna
  `tentativas` da linha do próprio código. Tem de estar ligado ao código e não
  à sessão do browser — se estivesse à sessão, bastava limpar os cookies para
  recomeçar do zero.
*/
export const tentativasAcesso = pgTable(
  "tentativas_acesso",
  {
    id: text("id").primaryKey(),
    /* `email:<sha256>` ou `ip:<endereço>`. O email vai em hash: a lista de
       quem tem acesso ao painel não precisa de ficar legível no armazenamento. */
    chave: text("chave").notNull(),
    /* `pedido` (pedir um código) — por agora o único. Fica como coluna e não
       implícito para o dia em que houver outra acção a limitar. */
    acao: text("acao").notNull(),
    ocorridoEm: timestamp("ocorrido_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    /* A consulta é sempre "quantas ocorrências desta chave, desta acção, desde
       há 15 minutos" — os três campos, por esta ordem. */
    index("tentativas_acesso_janela_idx").on(t.chave, t.acao, t.ocorridoEm),
  ],
);

export type ViaturaRow = typeof viaturas.$inferSelect;
export type ViaturaInsert = typeof viaturas.$inferInsert;
export type CodigoAcessoRow = typeof codigosAcesso.$inferSelect;
export type TentativaAcessoRow = typeof tentativasAcesso.$inferSelect;
