import type { Metadata } from "next";
import { CatalogoClient } from "@/components/catalogo/CatalogoClient";
import { viaturas } from "@/data/viaturas";
import { parseFiltros } from "@/lib/filtros";
import { openGraphRota, seoDescricao, seoTitulo } from "@/lib/seo";

const TOTAL = viaturas.length;
const TITULO = seoTitulo(
  `${TOTAL} ${TOTAL === 1 ? "viatura usada" : "viaturas usadas"} no Porto`,
);
const DESCRICAO = seoDescricao(
  `Stock completo do stand Império Auto Concept, no Porto: ${TOTAL} ${
    TOTAL === 1 ? "viatura" : "viaturas"
  } usadas e seminovas com garantia. Pesquise por marca, modelo, preço, ano e quilómetros.`,
);

/**
 * Os filtros vivem em query params. Cada combinação produz uma variante quase
 * idêntica da mesma listagem, e há dezenas — por isso só a listagem limpa é
 * indexável. O canonical aponta sempre para `/viaturas`, e as variantes levam
 * `noindex, follow`: não entram no índice, mas os links para as viaturas
 * continuam a ser seguidos.
 */
export async function generateMetadata({
  searchParams,
}: PageProps<"/viaturas">): Promise<Metadata> {
  const sp = await searchParams;
  const temFiltros = Object.values(sp).some(
    (v) => v !== undefined && v !== "",
  );

  return {
    title: TITULO,
    description: DESCRICAO,
    alternates: { canonical: "/viaturas" },
    robots: temFiltros ? { index: false, follow: true } : undefined,
    openGraph: openGraphRota({
      caminho: "/viaturas",
      titulo: TITULO,
      descricao: DESCRICAO,
    }),
  };
}

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
