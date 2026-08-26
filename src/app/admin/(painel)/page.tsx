import Image from "next/image";
import Link from "next/link";
import { exigirSessao } from "@/lib/painel/porta";
import {
  listarViaturas,
  SemBaseDeDados,
  type ViaturaPainel,
} from "@/lib/painel/viaturas";
import { AcoesViatura } from "@/components/admin/AcoesViatura";
import { BotaoSair, EsquecerAparelho } from "@/components/admin/BotoesDeSessao";
import {
  formatarData,
  formatarDataRelativa,
  formatarPreco,
} from "@/lib/format";
import type { EstadoVenda, Viatura } from "@/lib/types";

/*
  A listagem.

  O modelo é o gestor de vídeos do YouTube Studio: uma linha por anúncio, com o
  essencial visível e as acções à direita. A primeira coisa que aparece é a
  lista, não um menu — quem abre isto vem mudar um preço, não navegar.

  O `exigirSessao()` está aqui, na página, e não no layout. Ver
  `src/lib/painel/porta.ts` para a razão.
*/

export const metadata = { title: "Viaturas" };

/*
  As três cores de estado, e nenhuma delas é do Tailwind por omissão.

  A listagem do #12 escrevia `emerald-500` e `red-400`, que não existem em
  `docs/brand/`. Os tokens do sistema entraram no PR dos tokens precisamente
  para isto — e o verde é mais discreto que o vermelho de propósito: disponível
  é o estado de quase todas as viaturas, e se gritasse tanto como o vendido a
  listagem virava um semáforo.
*/
const ESTADO: Record<EstadoVenda, { texto: string; classe: string }> = {
  disponivel: {
    texto: "Disponível",
    classe: "border-sucesso-deep bg-sucesso/10 text-sucesso",
  },
  reservado: {
    texto: "Reservado",
    classe: "border-gold-deep bg-gold/10 text-gold",
  },
  vendido: {
    texto: "Vendido",
    classe: "border-red-deep bg-red/10 text-red-bright",
  },
};

/*
  O preço aparece sempre, mesmo nas vendidas.

  No site, uma viatura vendida troca o preço pela palavra "Vendido" — ali o
  preço já não é uma proposta e mostrá-lo seria enganador. **No painel é o
  contrário**: quem gere quer saber por quanto ficou, e repetir "Vendido" na
  coluna do preço ao lado do estado que já o diz é ruído numa tabela que
  existe para se ler de relance.
*/
function Estado({ estado }: { estado: EstadoVenda }) {
  const { texto, classe } = ESTADO[estado];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${classe}`}
    >
      {texto}
    </span>
  );
}

/*
  A miniatura, com o ponto dourado de destaque no canto.

  O ponto diz de relance quais as viaturas que aparecem na homepage — a
  informação que o cliente mais procura e que, sem isto, obrigava a abrir cada
  uma para descobrir.
*/
function Miniatura({ v }: { v: Viatura }) {
  return (
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line/60 bg-raised">
      {v.fotos[0] && (
        <Image
          src={v.fotos[0]}
          alt=""
          fill
          sizes="80px"
          className={`object-cover ${v.estadoVenda === "vendido" ? "opacity-60 saturate-50" : ""}`}
        />
      )}
      {v.destaque && (
        <span
          title="Em destaque na página inicial"
          className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-background"
        >
          <span className="sr-only">Em destaque</span>
        </span>
      )}
    </div>
  );
}

function Nome({ v }: { v: Viatura }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm text-ink">
        {v.marca} {v.modelo}
      </p>
      {v.versao && <p className="truncate text-xs text-muted">{v.versao}</p>}
    </div>
  );
}

export default async function Painel() {
  const { email } = await exigirSessao();

  let viaturas: ViaturaPainel[];
  try {
    viaturas = await listarViaturas();
  } catch (erro) {
    /*
      Só o caso "não há base configurada" é tratado aqui, porque tem uma
      resposta útil: dizer o que falta. Qualquer outra falha sobe para o
      `error.tsx` — no painel, uma leitura que falha **não** pode virar uma
      lista vazia com ar de normalidade.
    */
    if (erro instanceof SemBaseDeDados) {
      return (
        <Moldura email={email}>
          <div className="rounded-2xl border border-line/60 bg-surface px-8 py-16 text-center">
            <p className="font-display text-xl text-ink">
              A gestão ainda não está configurada
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Falta a ligação à base de dados. Enquanto isso, o site continua a
              servir o inventário publicado.
            </p>
          </div>
        </Moldura>
      );
    }
    throw erro;
  }

  return (
    <Moldura email={email} total={viaturas.length}>
      {viaturas.length === 0 ? (
        <div className="rounded-2xl border border-line/60 bg-surface px-8 py-20 text-center">
          <p className="font-display text-xl text-ink">Ainda não há viaturas</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Assim que acrescentar a primeira, ela aparece aqui e no site.
          </p>
          <Link
            href="/admin/viaturas/nova"
            className="gold-metal-fill press mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium text-background"
          >
            Adicionar viatura
          </Link>
        </div>
      ) : (
        <>
          {/* Telemóvel: cartões empilhados. A tabela não cabe, e deixá-la em
              deslize horizontal seria empurrar o problema para o dedo de quem
              a usa. */}
          <ul className="space-y-3 lg:hidden">
            {viaturas.map((v) => (
              <li
                key={v.id}
                className="rounded-2xl border border-line/60 bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <Miniatura v={v} />
                  <div className="min-w-0 flex-1">
                    <Nome v={v} />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Estado estado={v.estadoVenda} />
                      <span className="text-sm text-ink">
                        {formatarPreco(v.preco)}
                      </span>
                      <span
                        title={formatarData(v.criadoEm)}
                        className="text-xs text-muted"
                      >
                        {formatarDataRelativa(v.criadoEm)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 border-t border-line/40 pt-2">
                  <AcoesViatura id={v.id} nome={`${v.marca} ${v.modelo}`} />
                </div>
              </li>
            ))}
          </ul>

          {/* Computador: tabela. Mais densa que o site de propósito — aqui a
              leitura é tabular, não editorial. */}
          <div className="hidden overflow-hidden rounded-2xl border border-line/60 bg-surface lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line/60 text-left text-xs uppercase tracking-[0.15em] text-muted">
                  <th className="px-5 py-3 font-normal">Viatura</th>
                  <th className="px-5 py-3 font-normal">Estado</th>
                  <th className="px-5 py-3 font-normal">Preço</th>
                  <th className="px-5 py-3 font-normal">Publicado</th>
                  <th className="px-5 py-3 text-right font-normal">Acções</th>
                </tr>
              </thead>
              <tbody>
                {viaturas.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-line/40 last:border-0 transition-colors hover:bg-raised/40"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Miniatura v={v} />
                        <Nome v={v} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Estado estado={v.estadoVenda} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-ink">
                      {formatarPreco(v.preco)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-muted">
                      <span title={formatarData(v.criadoEm)}>
                        {formatarDataRelativa(v.criadoEm)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <AcoesViatura id={v.id} nome={`${v.marca} ${v.modelo}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Moldura>
  );
}

function Moldura({
  email,
  total,
  children,
}: {
  email: string;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-none text-ink">Viaturas</h1>
          <p className="mt-2 truncate text-sm text-muted">
            {total === undefined
              ? email
              : `${total} ${total === 1 ? "anúncio publicado" : "anúncios publicados"} · ${email}`}
          </p>
        </div>
        {/*
          Os dois na mesma linha e com a mesma altura. O primário leva o
          dourado; o secundário, contorno — a hierarquia faz-se pelo
          preenchimento, não pelo tamanho.
        */}
        <div className="flex shrink-0 items-center gap-2">
          {total !== undefined && (
            <Link
              href="/admin/viaturas/nova"
              className="gold-metal-fill press inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium text-background"
            >
              + Adicionar
            </Link>
          )}
          <BotaoSair />
        </div>
      </header>
      {children}
      <EsquecerAparelho />
    </main>
  );
}
