import Link from "next/link";
import { exigirSessao } from "@/lib/painel/porta";
import { BotoesDeSessao } from "@/components/admin/BotoesDeSessao";

/*
  O painel, por enquanto só com a porta.

  O `exigirSessao()` está **aqui, na página**, e não no layout. Um layout não
  volta a renderizar em navegação do lado do cliente nem impede um segmento
  filho de correr — pô-lo lá dava a sensação de proteger tudo o que está por
  baixo e não protegia nada. Cada página do painel chama-o por si.

  O CRUD das viaturas vem no PR seguinte; o que interessa verificar neste é a
  entrada.
*/

export default async function Painel() {
  const { email } = await exigirSessao();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Gestão</p>
          <h1 className="mt-3 font-display text-3xl text-ink">Painel</h1>
          <p className="mt-2 text-sm text-muted">Sessão de {email}</p>
        </div>
        <BotoesDeSessao />
      </header>

      <div className="mt-10 rounded-2xl border border-line/60 bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Viaturas</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A gestão de viaturas entra a seguir. Por agora, o que está montado é o
          acesso — e o site continua a servir o inventário publicado.
        </p>
        <Link
          href="/"
          className="press mt-6 inline-block rounded-full border border-gold/40 px-5 py-2.5 text-sm tracking-wide text-champagne transition-colors hover:border-gold hover:text-gold-bright"
        >
          Ver site ↗
        </Link>
      </div>
    </main>
  );
}
