import type { ReactNode } from "react";

/*
  Os campos dos formulários do site.

  O painel tem os seus, dentro do `ViaturaForm`, e continuam lá: são de quem
  publica anúncios todos os dias e valorizam densidade — daí os cantos
  rectos. Estes são para quem preenche um formulário uma vez na vida, no
  telemóvel, e seguem a receita redonda do resto do site.

  Todos os campos são **controlados**. Não é preferência: depois de uma server
  action o React 19 faz reset ao `<form>`, e um erro de envio apagava tudo o
  que a pessoa tinha escrito. Com o valor em estado, o que ela escreveu fica.

  ## O erro vive no campo, não só no fundo da página

  Cada campo aceita um `erro` e um `aoSair`. Quem decide *quando* mostrar é o
  `FormularioPedido` — aqui só se desenha o que ele mandar. A regra que ele
  aplica é a que se espera de um formulário longo: nada aparece enquanto se
  escreve, a frase surge ao sair do campo, e desaparece assim que o valor
  passa a servir.

  Os campos de escolha — `select`, pílulas — avisam ao mudar e não ao sair:
  escolher uma opção já é uma decisão terminada, e esperar pelo `blur` para
  dizer que falta escolher chega tarde de mais.
*/

/*
  A moldura sem cor de linha. A cor entra a seguir, e entra **uma só vez**:
  duas utilitárias de `border-color` na mesma classe deixam a que ganha ao
  acaso da ordem em que o Tailwind as escreve na folha.
*/
export const inputBase =
  "w-full rounded-xl border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 disabled:opacity-60";

const LINHA_CALMA = "border-line focus:border-gold";
const LINHA_ERRADA = "border-red-deep focus:border-red";

function moldura(erro?: string, extra = "") {
  return `${inputBase} ${erro ? LINHA_ERRADA : LINHA_CALMA} ${extra}`;
}

export const labelBase =
  "mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted";

type Comum = {
  nome: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  obrigatorio?: boolean;
  desativado?: boolean;
  /** Ocupa a linha toda numa grelha de duas colunas. */
  largo?: boolean;
  nota?: string;
  /** A frase que substitui a nota quando o que está escrito não serve. */
  erro?: string;
  /** O campo perdeu o foco: é o momento de o dar por preenchido. */
  aoSair?: () => void;
};

function Envolvente({
  rotulo,
  obrigatorio,
  largo,
  nota,
  erro,
  children,
}: {
  rotulo: string;
  obrigatorio?: boolean;
  largo?: boolean;
  nota?: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${largo ? "sm:col-span-2" : ""}`}>
      <span className={labelBase}>
        {rotulo}
        {!obrigatorio && <span className="ml-1.5 normal-case tracking-normal">(opcional)</span>}
      </span>
      {children}
      {/*
        O erro ocupa o lugar da nota em vez de se somar a ela: duas linhas de
        letra pequena por baixo do mesmo campo lêem-se como ruído, e a que
        interessa naquele momento é a que diz o que está mal.
      */}
      {erro ? (
        <span className="mt-1.5 block text-xs leading-relaxed text-red-bright">{erro}</span>
      ) : (
        nota && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{nota}</span>
      )}
    </label>
  );
}

export function Campo({
  tipo = "text",
  exemplo,
  autoPreencher,
  maximo,
  ...p
}: Comum & {
  tipo?: "text" | "email" | "tel";
  exemplo?: string;
  autoPreencher?: string;
  maximo?: number;
}) {
  return (
    <Envolvente {...p}>
      <input
        type={tipo}
        name={p.nome}
        value={p.valor}
        onChange={(e) => p.aoMudar(e.target.value)}
        onBlur={p.aoSair}
        required={p.obrigatorio}
        disabled={p.desativado}
        placeholder={exemplo}
        autoComplete={autoPreencher}
        maxLength={maximo}
        aria-invalid={p.erro ? true : undefined}
        className={moldura(p.erro)}
      />
    </Envolvente>
  );
}

export function CampoNumero({
  minimo,
  maximo,
  exemplo,
  sufixo,
  ...p
}: Comum & { minimo?: number; maximo?: number; exemplo?: string; sufixo?: string }) {
  return (
    <Envolvente {...p}>
      <span className="relative block">
        <input
          /*
            `inputMode="numeric"` em vez de `type="number"`: abre o teclado
            certo no telemóvel sem trazer as setas do desktop, que num campo
            de quilómetros só servem para enganar o dedo.
          */
          type="text"
          inputMode="numeric"
          name={p.nome}
          value={p.valor}
          onChange={(e) => p.aoMudar(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={p.aoSair}
          required={p.obrigatorio}
          disabled={p.desativado}
          placeholder={exemplo}
          min={minimo}
          max={maximo}
          aria-invalid={p.erro ? true : undefined}
          className={moldura(p.erro, sufixo ? "pr-12" : "")}
        />
        {sufixo && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted"
          >
            {sufixo}
          </span>
        )}
      </span>
    </Envolvente>
  );
}

export function CampoSelecao({
  opcoes,
  vazio,
  ...p
}: Comum & {
  /** `[valor, rótulo]`, ou uma string quando os dois são iguais. */
  opcoes: readonly (string | readonly [string, string])[];
  /** O que aparece antes de escolher. Sem isto, o campo é obrigatório de facto. */
  vazio?: string;
}) {
  return (
    <Envolvente {...p}>
      <span className="relative block">
        <select
          name={p.nome}
          value={p.valor}
          onChange={(e) => {
            p.aoMudar(e.target.value);
            p.aoSair?.();
          }}
          onBlur={p.aoSair}
          required={p.obrigatorio}
          disabled={p.desativado}
          aria-invalid={p.erro ? true : undefined}
          className={moldura(p.erro, "appearance-none bg-surface/80 pr-10 [&>option]:bg-surface")}
        >
          {vazio !== undefined && <option value="">{vazio}</option>}
          {opcoes.map((o) => {
            const [valor, rotulo] = typeof o === "string" ? [o, o] : o;
            return (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            );
          })}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold"
        >
          ▾
        </span>
      </span>
    </Envolvente>
  );
}

export function CampoArea({
  linhas = 4,
  exemplo,
  maximo,
  ...p
}: Comum & { linhas?: number; exemplo?: string; maximo?: number }) {
  return (
    <Envolvente {...p}>
      <textarea
        name={p.nome}
        value={p.valor}
        onChange={(e) => p.aoMudar(e.target.value)}
        onBlur={p.aoSair}
        required={p.obrigatorio}
        disabled={p.desativado}
        placeholder={exemplo}
        rows={linhas}
        maxLength={maximo}
        aria-invalid={p.erro ? true : undefined}
        className={moldura(p.erro, "resize-y leading-relaxed")}
      />
    </Envolvente>
  );
}

/*
  Uma escolha entre poucas opções, em pílulas.

  Podia ser um `<select>`, e não devia: quando a pergunta é a que muda a
  conversa toda — vender ou dar de retoma — as duas respostas têm de estar à
  vista sem abrir nada. São `<input type="radio">` verdadeiros, escondidos
  com `sr-only`, para o teclado e os leitores de ecrã continuarem a ver um
  grupo de opções.
*/
export function CampoEscolha({
  nome,
  rotulo,
  valor,
  aoMudar,
  opcoes,
  desativado,
  largo,
  erro,
  aoSair,
}: {
  nome: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  opcoes: readonly (readonly [string, string])[];
  desativado?: boolean;
  largo?: boolean;
  erro?: string;
  aoSair?: () => void;
}) {
  return (
    <fieldset className={largo ? "sm:col-span-2" : ""}>
      <legend className={labelBase}>{rotulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map(([v, r]) => (
          <label
            key={v}
            className={`press cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:checked]:border-gold has-[:checked]:text-gold-bright has-[:focus-visible]:border-gold ${
              valor === v
                ? "border-gold text-gold-bright"
                : erro
                  ? "border-red-deep text-muted"
                  : "border-line text-muted"
            } ${desativado ? "opacity-60" : ""}`}
          >
            <input
              type="radio"
              name={nome}
              value={v}
              checked={valor === v}
              onChange={() => {
                aoMudar(v);
                aoSair?.();
              }}
              disabled={desativado}
              className="sr-only"
            />
            {r}
          </label>
        ))}
      </div>
      {erro && <p className="mt-1.5 text-xs leading-relaxed text-red-bright">{erro}</p>}
    </fieldset>
  );
}

export function CampoConsentimento({
  nome,
  marcado,
  aoMudar,
  desativado,
  erro,
  children,
}: {
  nome: string;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
  desativado?: boolean;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
        <input
          type="checkbox"
          name={nome}
          checked={marcado}
          onChange={(e) => aoMudar(e.target.checked)}
          disabled={desativado}
          aria-invalid={erro ? true : undefined}
          /*
            `accent-color` pinta a caixa nativa de dourado sem a substituir por
            um desenho nosso — a caixa do sistema continua a ser a que o teclado
            e os leitores de ecrã conhecem.
          */
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--gold)] disabled:opacity-60"
        />
        <span>{children}</span>
      </label>
      {erro && <p className="mt-1.5 text-xs leading-relaxed text-red-bright">{erro}</p>}
    </div>
  );
}

export function Aviso({ children, ref }: { children: ReactNode; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-xl border border-red-deep bg-red/10 p-4 text-sm leading-relaxed text-red-bright outline-none"
    >
      {children}
    </div>
  );
}

export function Sucesso({
  children,
  ref,
}: {
  children: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="rounded-2xl border border-line/60 bg-raised/60 p-8 outline-none"
    >
      {children}
    </div>
  );
}
