import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/painel/porta";
import { obterViatura, opcoesConhecidas } from "@/lib/painel/viaturas";
import { ViaturaForm } from "@/components/admin/ViaturaForm";

export const metadata = { title: "Editar viatura" };

export default async function EditarViatura({
  params,
}: PageProps<"/admin/viaturas/[id]">) {
  await exigirSessao();
  const { id } = await params;

  const [viatura, { marcas, modelos }] = await Promise.all([
    obterViatura(id),
    opcoesConhecidas(),
  ]);

  if (!viatura) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <Link
          href="/admin"
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-gold-bright hover:underline"
        >
          ← Viaturas
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink">
          {viatura.marca} {viatura.modelo}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {/*
            O endereço da ficha no site fica visível de propósito: é o que
            explica, sem o dizer, porque é que corrigir a marca não o muda.
          */}
          /carros/{viatura.marcaSlug}/{viatura.modeloSlug}/{viatura.id}
        </p>
      </header>

      <ViaturaForm viatura={viatura} marcas={marcas} modelos={modelos} />
    </main>
  );
}
