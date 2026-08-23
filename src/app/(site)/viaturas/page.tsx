import type { Metadata } from "next";
import { CatalogoClient } from "@/components/catalogo/CatalogoClient";
import { openGraphRota, seoDescricao, seoTitulo } from "@/lib/seo";
import { getViaturas } from "@/lib/viaturas";

/*
  Esta página é um ficheiro estático, e é de propósito.

  Os filtros vivem no endereço, mas quem filtra é o browser — o
  `CatalogoClient` recebe o inventário inteiro e reduz a lista em memória. Ler
  os filtros no servidor obrigava a renderizar a página a cada visita, e com o
  inventário a vir da base de dados isso seria uma consulta ao Neon por
  visitante, na página mais visitada a seguir à homepage. Ver
  `docs/admin/07-tarefas-e-custos.md`.

  O `noindex` das variantes filtradas não desapareceu — passou a cabeçalho
  `X-Robots-Tag`, emitido pelo `next.config.ts` quando o endereço traz algum
  parâmetro de filtro. Faz falta: a grelha de marcas da homepage, as fichas de
  viatura e o próprio JSON-LD têm links para `/viaturas?marca=…`, e o Google
  segue-os.
*/

async function textos() {
  const total = (await getViaturas()).length;
  const plural = total === 1 ? "viatura" : "viaturas";
  return {
    titulo: seoTitulo(`${total} ${plural} usadas no Porto`),
    descricao: seoDescricao(
      `Stock completo do stand Império Auto Concept, no Porto: ${total} ${plural} usadas e seminovas com garantia. Pesquise por marca, modelo, preço, ano e quilómetros.`,
    ),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { titulo, descricao } = await textos();

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: "/viaturas" },
    openGraph: openGraphRota({
      caminho: "/viaturas",
      titulo,
      descricao,
    }),
  };
}

export default async function ViaturasPage() {
  const viaturas = await getViaturas();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <header className="mb-10">
        <h1 className="font-display h-section text-ink">
          Todas as <span className="italic text-gold">viaturas</span>
        </h1>
      </header>
      <CatalogoClient viaturas={viaturas} />
    </div>
  );
}
