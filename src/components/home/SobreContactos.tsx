import { Reveal } from "@/components/ui/Reveal";
import { stand } from "@/data/stand";

const enderecoCompleto = `${stand.morada}, ${stand.codigoPostal}`;
// Morada exata (sem o nome do stand) para o Google geocodificar o ponto certo
// e colocar o pin; nome no negócio pode desviar o resultado.
const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  enderecoCompleto,
)}&hl=pt&z=16&output=embed`;

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

            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Onde estamos
            </p>
            <p className="mt-4 font-display text-2xl text-ink">{stand.nome}</p>
            <p className="mt-1 text-sm text-muted">{enderecoCompleto}</p>

            <div className="mt-5 space-y-1 text-sm">
              <p>
                <a
                  href={`tel:+351${stand.telefone.replaceAll(" ", "")}`}
                  className="text-champagne transition-colors hover:text-gold-bright"
                >
                  {stand.telefone}
                </a>{" "}
                <span className="text-xs text-muted">({stand.telefoneNota})</span>
              </p>
              <p>
                <a
                  href={`tel:+351${stand.telemovel.replaceAll(" ", "")}`}
                  className="text-champagne transition-colors hover:text-gold-bright"
                >
                  {stand.telemovel}
                </a>{" "}
                <span className="text-xs text-muted">({stand.telemovelNota})</span>
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">
                Horário
              </p>
              <ul className="mt-3 max-w-sm space-y-1.5 text-sm text-muted">
                {stand.horarios.map((h) => (
                  <li key={h.dias} className="flex justify-between gap-4">
                    <span>{h.dias}</span>
                    <span className="text-ink">{h.horas}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={stand.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex rounded-full border border-gold/40 px-5 py-2.5 text-sm text-champagne hover:border-gold hover:text-gold-bright"
              >
                Abrir no Google Maps ↗
              </a>
              <a
                href={stand.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex rounded-full border border-gold/40 px-5 py-2.5 text-sm text-champagne hover:border-gold hover:text-gold-bright"
              >
                WhatsApp ↗
              </a>
              <a
                href={stand.instagram}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex rounded-full border border-gold/40 px-5 py-2.5 text-sm text-champagne hover:border-gold hover:text-gold-bright"
              >
                Instagram ↗
              </a>
              <a
                href={stand.facebook}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex rounded-full border border-gold/40 px-5 py-2.5 text-sm text-champagne hover:border-gold hover:text-gold-bright"
              >
                Facebook ↗
              </a>
            </div>
          </div>
        </Reveal>

        {/* Direita — mapa embebido */}
        <Reveal delay={0.1}>
          <div className="h-full min-h-[360px] overflow-hidden rounded-2xl border border-line/60 bg-surface md:min-h-[520px]">
            <iframe
              title={`Mapa — ${stand.nome}`}
              src={mapaEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full w-full grayscale-[0.3] contrast-[1.05]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
