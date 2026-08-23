import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExtrasList } from "@/components/car/ExtrasList";
import { Gallery } from "@/components/car/Gallery";
import { SpecsTable } from "@/components/car/SpecsTable";
import { StickyCard } from "@/components/car/StickyCard";
import { Sugestoes } from "@/components/car/Sugestoes";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatarKm, formatarPreco } from "@/lib/format";
import { dadosPercurso, dadosViatura } from "@/lib/jsonld";
import { openGraphRota, seoDescricao, seoTitulo } from "@/lib/seo";
import { urlViatura } from "@/lib/slug";
import { getViatura, getSugestoes, getViaturas } from "@/lib/viaturas";

export async function generateStaticParams() {
  const viaturas = await getViaturas();
  return viaturas.map((v) => ({
    marca: v.marcaSlug,
    modelo: v.modeloSlug,
    id: v.id,
  }));
}

/*
  O id sozinho identifica a viatura; a marca e o modelo estão no caminho por
  causa do SEO. Confirmam-se na mesma: sem isso, `/carros/bmw/x5/v-0001`
  serviria o Porsche com um endereço que diz outra coisa — conteúdo duplicado
  em endereços infinitos, que é exactamente o que os canonicals existem para
  evitar.
*/
async function encontrarViatura(marca: string, modelo: string, id: string) {
  const v = await getViatura(id);
  return v && v.marcaSlug === marca && v.modeloSlug === modelo ? v : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/carros/[marca]/[modelo]/[id]">): Promise<Metadata> {
  const { marca, modelo, id } = await params;
  const v = await encontrarViatura(marca, modelo, id);
  if (!v) return { title: "Viatura não encontrada", robots: { index: false } };

  // O `seoTitulo` corta pelo espaço mais próximo do limite, contando já com o
  // sufixo da marca — sem isto, um "CLA 220 d 4Matic OrangeArt Edition" dá um
  // title de 75 caracteres que o Google trunca a meio da versão.
  const titulo = seoTitulo(
    `${v.marca} ${v.modelo} ${v.versao} ${v.registoAno}`,
  );
  const ficha = `${v.marca} ${v.modelo} ${v.versao} de ${v.registoAno}, ${formatarKm(
    v.quilometros,
  )}, ${v.combustivel}`;
  // O `clamp` dentro de `seoDescricao` normaliza os espaços finos que o Intl
  // insere nos números — de outro modo saem para o HTML como &nbsp; em bruto.
  // Uma viatura vendida não anuncia preço nem garantia: a página mantém-se
  // (links partilhados no WhatsApp continuam a abrir) mas encaminha ao stock.
  const descricao = seoDescricao(
    v.estadoVenda === "vendido"
      ? `${ficha}. Esta viatura já foi vendida — veja o stock disponível no stand Império Auto Concept, no Porto.`
      : `${ficha}, por ${formatarPreco(v.preco)}. Garantia de ${
          v.garantia
        }. Stand Império Auto Concept, no Porto.`,
  );

  const caminho = urlViatura(v);

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: openGraphRota({
      caminho,
      titulo,
      descricao,
      // Sem width/height: as fotos não são 1200×630 e declarar medidas erradas
      // faz o Facebook recortar mal. A fotografia real da viatura vale mais do
      // que a imagem gerada do `opengraph-image.tsx` da raiz.
      imagens: [
        { url: v.fotos[0], alt: `${v.marca} ${v.modelo} ${v.versao}` },
      ],
    }),
  };
}

export default async function ViaturaPage({
  params,
}: PageProps<"/carros/[marca]/[modelo]/[id]">) {
  const { marca, modelo, id } = await params;
  const v = await encontrarViatura(marca, modelo, id);
  if (!v) notFound();

  return (
    <>
      <JsonLd dados={dadosViatura(v)} />
      <JsonLd dados={dadosPercurso(v)} />

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

      <Sugestoes sugestoes={await getSugestoes(v.id)} />
    </>
  );
}
