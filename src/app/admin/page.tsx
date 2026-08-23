import Link from "next/link";

/*
  O que está aqui é um marcador, não o painel.

  A rota existe desde já para o grupo `(site)` ter contra o que ser verificado:
  se `/admin` responde sem cabeçalho nem rodapé, a fronteira funciona.

  A frase é a que `docs/admin/01` prescreve para quando não há base de dados
  configurada — é este o comportamento que o painel a sério vai manter enquanto
  o `DATABASE_URL` não existir, em vez de rebentar.
*/

export default function AdminPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Gestão</p>
      <h1 className="mt-4 font-display text-3xl text-ink">
        Ainda não está configurada
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        O painel de gestão de viaturas está em construção. Entretanto, o site
        continua a servir o inventário publicado.
      </p>
      <Link
        href="/"
        className="mt-8 self-start rounded-full border border-gold/40 px-5 py-2.5 text-sm tracking-wide text-champagne transition-colors hover:border-gold hover:text-gold-bright"
      >
        Voltar ao site
      </Link>
    </div>
  );
}
