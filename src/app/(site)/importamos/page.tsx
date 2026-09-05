import type { Metadata } from "next";
import { ComoFunciona } from "@/components/pedidos/ComoFunciona";
import { FormularioImportacao } from "@/components/pedidos/FormularioImportacao";
import { BotaoLink } from "@/components/ui/Botao";
import { Reveal } from "@/components/ui/Reveal";
import { openGraphRota, seoDescricao, seoTitulo } from "@/lib/seo";

/*
  «Importamos o seu carro» — para quem não encontrou o que procurava.

  Com seis viaturas em stock, quem sai do catálogo de mãos a abanar é a
  maioria. Esta página aproveita essa visita: em vez de a pessoa fechar o
  separador, diz o que procura e o stand vai buscá-lo.

  Sobre o que se promete: **nada**. Não há prazos — o cliente respondeu que
  não quer nenhum —, e os custos ficam para os Termos, que dizem o essencial:
  o valor indicado é o da viatura, e o serviço e o transporte vêm à parte.
*/

const TITULO = seoTitulo("Importamos o seu carro por encomenda");
const DESCRICAO = seoDescricao(
  "Não encontrou a viatura no stock? Diga-nos marca, modelo, ano, quilómetros e orçamento e o Império Auto Concept procura-a por encomenda, sem compromisso.",
);

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: "/importamos" },
  openGraph: openGraphRota({
    caminho: "/importamos",
    titulo: TITULO,
    descricao: DESCRICAO,
  }),
};

const PASSOS = [
  {
    titulo: "Diz o que procura",
    texto:
      "Marca, modelo, a partir de que ano, e o que não pode faltar. Quanto mais fechado for o pedido, mais certeira é a procura.",
  },
  {
    titulo: "Procuramos",
    texto:
      "Dentro e fora do país, no que existe à venda e no que ainda não chegou ao mercado, com o seu orçamento como limite.",
  },
  {
    titulo: "Apresentamos o que aparecer",
    texto:
      "Com o preço final e as condições por escrito antes de qualquer compromisso. Se nada servir, não avançamos — e não fica a dever nada.",
  },
];

export default function Importamos() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display h-section text-ink">
          Importamos o seu <span className="italic text-gold">carro</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Não encontrou no stock a viatura que procurava? Descreva-a. Vamos ao
          mercado atrás dela — e só avançamos quando o preço e as condições
          estiverem à sua frente, por escrito.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        <Reveal>
          <FormularioImportacao />
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
          <ComoFunciona titulo="Como funciona" passos={PASSOS} />
        </Reveal>
      </div>

      <div className="hairline mt-16" />

      <div className="mt-10 text-center">
        <p className="text-sm text-muted">
          Antes de encomendar, veja o que já está no stand.
        </p>
        <BotaoLink href="/viaturas" variante="contorno" className="mt-4">
          Ver as viaturas em stock
        </BotaoLink>
      </div>
    </div>
  );
}
