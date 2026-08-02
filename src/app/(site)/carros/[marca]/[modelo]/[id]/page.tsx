import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExtrasList } from "@/components/car/ExtrasList";
import { Gallery } from "@/components/car/Gallery";
import { SpecsTable } from "@/components/car/SpecsTable";
import { StickyCard } from "@/components/car/StickyCard";
import { Sugestoes } from "@/components/car/Sugestoes";
import { formatarKm, formatarPreco } from "@/lib/format";
import { getSugestoes, getViatura } from "@/lib/viaturas";

// Renderização dinâmica: novas viaturas ficam disponíveis de imediato após serem
// criadas no /admin (sem depender de páginas geradas no build).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/carros/[marca]/[modelo]/[id]">): Promise<Metadata> {
  const { marca, modelo, id } = await params;
  const v = await getViatura(id);
  if (!v || v.marcaSlug !== marca || v.modeloSlug !== modelo) {
    return { title: "Viatura não encontrada" };
  }

  const titulo = `${v.marca} ${v.modelo} ${v.versao} — ${v.registoAno}`;
  const descricao = `${v.marca} ${v.modelo} ${v.versao}, ${v.registoAno}, ${formatarKm(
    v.quilometros,
  )}, ${v.combustivel}. ${
    v.estadoVenda === "vendido" ? "Vendido" : formatarPreco(v.preco)
  }. ${v.descricao}`;

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: v.fotos[0] ? [{ url: v.fotos[0] }] : undefined,
    },
  };
}

export default async function ViaturaPage({
  params,
}: PageProps<"/carros/[marca]/[modelo]/[id]">) {
  const { marca, modelo, id } = await params;
  const v = await getViatura(id);
  if (!v || v.marcaSlug !== marca || v.modeloSlug !== modelo) notFound();

  const sugestoes = await getSugestoes(v.id);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <nav aria-label="Percurso" className="mb-6 text-xs text-muted">
          <Link href="/viaturas" className="transition-colors hover:text-gold-bright">
            Viaturas
          </Link>
          <span className="mx-2 text-gold-deep">/</span>
          <Link
            href={`/viaturas?marca=${v.marcaSlug}`}
            className="transition-colors hover:text-gold-bright"
          >
            {v.marca}
          </Link>
          <span className="mx-2 text-gold-deep">/</span>
          <span className="text-champagne">{v.modelo}</span>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            {v.marca}
          </p>
          <h1 className="mt-2 font-display h-section text-ink">
            {v.modelo}{" "}
            <span className="italic text-gold">{v.versao}</span>
          </h1>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-14">
            <Gallery fotos={v.fotos} alt={`${v.marca} ${v.modelo}`} />
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              {v.descricao}
            </p>
            <SpecsTable viatura={v} />
            <ExtrasList viatura={v} />
          </div>

          <aside>
            <StickyCard viatura={v} />
          </aside>
        </div>
      </div>

      <Sugestoes sugestoes={sugestoes} />
    </>
  );
}
