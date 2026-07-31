import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { terminarSessao } from "@/app/admin/auth-actions";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await auth();
  if (!sessao) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-baseline gap-3">
            <span className="text-xs uppercase tracking-[0.28em] text-gold">
              Imperio Auto Concept
            </span>
            <span className="hidden text-xs text-muted sm:inline">Gestão</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs tracking-wide text-muted transition-colors hover:text-champagne"
            >
              Ver site ↗
            </Link>
            <span className="hidden text-xs text-muted md:inline">
              {sessao.user?.email}
            </span>
            <form action={terminarSessao}>
              <button
                type="submit"
                className="border border-line px-3 py-1.5 text-xs tracking-wide text-muted transition-colors hover:border-gold hover:text-gold"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
