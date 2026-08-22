import { DadosContacto } from "@/components/contactos/DadosContacto";
import { MapaStand } from "@/components/contactos/MapaStand";
import { Reveal } from "@/components/ui/Reveal";
import { stand } from "@/data/stand";

export function SobreContactos() {
  return (
    <section
      id="contactos"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="grid gap-12 md:grid-cols-2 md:items-stretch">
        {/* Esquerda — quem somos, contactos e horário */}
        <Reveal>
          <div>
            <h2 className="font-display h-section text-ink">
              Qualidade e <span className="italic text-gold">confiança</span>
            </h2>
            {stand.sobre.map((paragrafo) => (
              <p
                key={paragrafo.slice(0, 24)}
                className="mt-5 max-w-lg text-base leading-relaxed text-muted"
              >
                {paragrafo}
              </p>
            ))}

            <div className="hairline my-8" />

            <DadosContacto />
          </div>
        </Reveal>

        {/* Direita — mapa embebido */}
        <Reveal delay={0.1}>
          <MapaStand className="h-full min-h-[360px] md:min-h-[520px]" />
        </Reveal>
      </div>
    </section>
  );
}
