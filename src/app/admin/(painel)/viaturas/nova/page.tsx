import Link from "next/link";
import { exigirSessao } from "@/lib/painel/porta";
import { opcoesConhecidas } from "@/lib/painel/viaturas";
import { ViaturaForm } from "@/components/admin/ViaturaForm";

export const metadata = { title: "Nova viatura" };

export default async function NovaViatura() {
  await exigirSessao();
  const { marcas, modelos } = await opcoesConhecidas();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <Link
          href="/admin"
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-gold-bright hover:underline"
        >
          ← Viaturas
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink">Nova viatura</h1>
      </header>

      <ViaturaForm marcas={marcas} modelos={modelos} />
    </main>
  );
}
