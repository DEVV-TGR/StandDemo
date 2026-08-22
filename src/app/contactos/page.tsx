import type { Metadata } from "next";
import { DadosContacto } from "@/components/contactos/DadosContacto";
import { MapaStand } from "@/components/contactos/MapaStand";
import { BotaoLink } from "@/components/ui/Botao";
import { Reveal } from "@/components/ui/Reveal";
import { stand } from "@/data/stand";
import { openGraphRota, seoDescricao, seoTitulo } from "@/lib/seo";

const TITULO = seoTitulo("Contactos e morada no Porto");
const DESCRICAO = seoDescricao(
  `Stand Império Auto Concept: ${stand.morada}, ${stand.localidade}. Telefone, WhatsApp, horário de abertura e mapa. Aberto de segunda a sábado.`,
);

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: "/contactos" },
  openGraph: openGraphRota({
    caminho: "/contactos",
    titulo: TITULO,
    descricao: DESCRICAO,
  }),
};

/**
 * Página real de contactos, em vez de apenas a âncora /#contactos.
 *
 * Para um negócio local é das páginas que o Google mais associa à entidade —
 * uma âncora numa homepage não é indexável nem aparece em resultados de
 * "morada" ou "horário". A secção da homepage mantém-se: são os mesmos
 * blocos, montados de forma diferente, sem o texto institucional.
 */
export default function ContactosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display h-section text-ink">
          Venha <span className="italic text-gold">conhecer-nos</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Estamos no Porto, na {stand.morada}. Apareça sem marcação ou
          ligue-nos antes — se quiser ver uma viatura em concreto, deixamo-la
          pronta para si.
        </p>
      </header>

      <div className="grid gap-12 md:grid-cols-2 md:items-stretch">
        <Reveal>
          <DadosContacto />
        </Reveal>
        <Reveal delay={0.1}>
          <MapaStand className="h-full min-h-[360px] md:min-h-[520px]" />
        </Reveal>
      </div>

      <div className="hairline mt-16" />
      <div className="mt-10 text-center">
        <p className="text-sm text-muted">
          Já sabe o que procura?
        </p>
        <BotaoLink href="/viaturas" className="mt-4">
          Ver as viaturas em stock
        </BotaoLink>
      </div>
    </div>
  );
}
