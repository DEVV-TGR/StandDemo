import type { Metadata } from "next";
import { ComoFunciona } from "@/components/pedidos/ComoFunciona";
import { FormularioCompra } from "@/components/pedidos/FormularioCompra";
import { BotaoLink } from "@/components/ui/Botao";
import { Reveal } from "@/components/ui/Reveal";
import { openGraphRota, seoDescricao, seoTitulo } from "@/lib/seo";

/*
  «Compramos o seu carro» — o outro lado do site.

  Até aqui o site só falava para quem compra. Isto abre a porta a quem quer
  vender ou dar de retoma, que é metade de quem entra num stand.

  A página não promete prazos nem valores: o que promete está nos Termos, e
  é lá que se lê que um pedido enviado pelo site não vincula ninguém.
*/

const TITULO = seoTitulo("Compramos o seu carro no Porto");
const DESCRICAO = seoDescricao(
  "Quer vender o seu carro ou dá-lo de retoma? Descreva a viatura e o Império Auto Concept, no Porto, contacta-o com uma avaliação. Por formulário ou WhatsApp.",
);

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: "/compramos" },
  openGraph: openGraphRota({
    caminho: "/compramos",
    titulo: TITULO,
    descricao: DESCRICAO,
  }),
};

const PASSOS = [
  {
    titulo: "Descreve a viatura",
    texto:
      "Os dados do documento único, os quilómetros e o estado. As fotografias ajudam, mas não são obrigatórias.",
  },
  {
    titulo: "Vemos o que vale",
    texto:
      "Olhamos ao estado, ao histórico e ao que o mercado está a fazer àquele modelo à data.",
  },
  {
    titulo: "Falamos consigo",
    texto:
      "Damos-lhe um valor e explicamos como lá chegámos. Sem compromisso: a decisão de vender é sua, e só é firme por escrito.",
  },
];

export default function Compramos() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display h-section text-ink">
          Compramos o seu <span className="italic text-gold">carro</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Venda directa ou retoma na compra de outra viatura. Diga-nos o que
          tem, e dizemos-lhe quanto vale — sem compromisso e sem ter de sair
          de casa para o saber.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        <Reveal>
          <FormularioCompra />
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
          <ComoFunciona titulo="Como funciona" passos={PASSOS} />
        </Reveal>
      </div>

      <div className="hairline mt-16" />

      <div className="mt-10 text-center">
        <p className="text-sm text-muted">
          E se o que procura for outro carro, e não o que tem?
        </p>
        <BotaoLink href="/importamos" variante="contorno" className="mt-4">
          Importamos por encomenda
        </BotaoLink>
      </div>
    </div>
  );
}
