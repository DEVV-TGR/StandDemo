import type { Metadata } from "next";
import { CatalogoClient } from "@/components/catalogo/CatalogoClient";
import { parseFiltros } from "@/lib/filtros";

export const metadata: Metadata = {
  title: "Viaturas",
  description:
    "Pesquise o nosso stock de viaturas premium por marca, modelo, preço, ano, quilómetros e mais.",
};

export default async function ViaturasPage({
  searchParams,
}: PageProps<"/viaturas">) {
  const sp = await searchParams;
  const filtrosIniciais = parseFiltros(sp);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <header className="mb-10">
        <h1 className="font-display h-section text-ink">
          Todas as <span className="italic text-gold">viaturas</span>
        </h1>
      </header>
      <CatalogoClient filtrosIniciais={filtrosIniciais} />
    </div>
  );
}
