import { Reveal } from "@/components/ui/Reveal";
import { stand } from "@/data/stand";

export function SobreContactos() {
  return (
    <section id="contactos" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-14 md:grid-cols-2">
        <Reveal>
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
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border border-line/60 bg-surface p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Onde estamos
            </p>
            <p className="mt-4 font-display text-2xl text-ink">{stand.nome}</p>
            <p className="mt-1 text-sm text-muted">
              {stand.morada}, {stand.codigoPostal}
            </p>

            <div className="mt-6 space-y-1 text-sm">
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

            <div className="hairline my-6" />

            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              Horário
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {stand.horarios.map((h) => (
                <li key={h.dias} className="flex justify-between gap-4">
                  <span>{h.dias}</span>
                  <span className="text-ink">{h.horas}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={stand.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex border border-gold/40 px-5 py-2.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright"
              >
                Abrir no Google Maps ↗
              </a>
              <a
                href={stand.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex border border-gold/40 px-5 py-2.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright"
              >
                Instagram ↗
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
