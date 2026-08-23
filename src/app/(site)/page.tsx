import type { Metadata } from "next";
import { Destaques } from "@/components/home/Destaques";
import { GrelhaMarcas } from "@/components/home/GrelhaMarcas";
import { Hero } from "@/components/home/Hero";
import { SobreContactos } from "@/components/home/SobreContactos";
import { openGraphRota, seoDescricao } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const TITULO = `${SITE_NAME} — Stand de carros usados no Porto`;
const DESCRICAO = seoDescricao(
  "Stand de automóveis premium no Porto. Viaturas usadas e seminovas selecionadas a dedo, com garantia e histórico documentado. Rua do Freixo 1680.",
);

export const metadata: Metadata = {
  // `absolute` para o sufixo do template não duplicar o nome da marca.
  title: { absolute: TITULO },
  description: DESCRICAO,
  alternates: { canonical: "/" },
  openGraph: openGraphRota({
    caminho: "/",
    titulo: TITULO,
    descricao: DESCRICAO,
  }),
};

export default function Home() {
  return (
    <>
      <Hero />
      <Destaques />
      <GrelhaMarcas />
      <SobreContactos />
    </>
  );
}
