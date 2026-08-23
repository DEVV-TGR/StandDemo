CREATE TABLE "codigos_acesso" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"codigo_hash" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"consumido_em" timestamp with time zone,
	"tentativas" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tentativas_acesso" (
	"id" text PRIMARY KEY NOT NULL,
	"chave" text NOT NULL,
	"acao" text NOT NULL,
	"ocorrido_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viaturas" (
	"id" text PRIMARY KEY NOT NULL,
	"marca" text NOT NULL,
	"marca_slug" text NOT NULL,
	"modelo" text NOT NULL,
	"modelo_slug" text NOT NULL,
	"versao" text DEFAULT '' NOT NULL,
	"preco" integer NOT NULL,
	"registo_mes" integer NOT NULL,
	"registo_ano" integer NOT NULL,
	"quilometros" integer NOT NULL,
	"lugares" integer NOT NULL,
	"portas" integer NOT NULL,
	"segmento" text NOT NULL,
	"combustivel" text NOT NULL,
	"potencia_cv" integer NOT NULL,
	"cilindrada_cc" integer NOT NULL,
	"transmissao" text NOT NULL,
	"cor" text DEFAULT '' NOT NULL,
	"cor_interior" text DEFAULT '' NOT NULL,
	"origem" text DEFAULT '' NOT NULL,
	"estado" text DEFAULT 'Usado' NOT NULL,
	"garantia" text DEFAULT '' NOT NULL,
	"livro_revisoes" boolean DEFAULT false NOT NULL,
	"segunda_chave" boolean DEFAULT false NOT NULL,
	"classe_portagem" text DEFAULT '' NOT NULL,
	"matricula" text DEFAULT '' NOT NULL,
	"vin" text DEFAULT '' NOT NULL,
	"fotos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"extras" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"destaque" boolean DEFAULT false NOT NULL,
	"estado_venda" text DEFAULT 'disponivel' NOT NULL,
	"iva_dedutivel" boolean DEFAULT false NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "codigos_acesso_email_idx" ON "codigos_acesso" USING btree ("email");--> statement-breakpoint
CREATE INDEX "codigos_acesso_expira_idx" ON "codigos_acesso" USING btree ("expira_em");--> statement-breakpoint
CREATE INDEX "tentativas_acesso_janela_idx" ON "tentativas_acesso" USING btree ("chave","acao","ocorrido_em");