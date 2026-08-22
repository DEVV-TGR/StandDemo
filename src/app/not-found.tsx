import { CarCard } from "@/components/car/CarCard";
import { BotaoLink } from "@/components/ui/Botao";
import { stand } from "@/data/stand";
import { getDisponiveis } from "@/lib/derivados";

/**
 * Uma 404 num site de stand recebe sobretudo tráfego de intenção de compra:
 * links de viaturas vendidas partilhados no WhatsApp, resultados antigos do
 * Google, anúncios expirados. Tratá-la como beco sem saída é desperdiçar um
 * lead — por isso mostra stock, e não só um pedido de desculpas.
 *
 * O `not-found.tsx` não aceita `metadata`; também não precisa de noindex,
 * porque a rota responde mesmo com HTTP 404 (verificado em produção).
 */
export default function NotFound() {
  const sugestoes = getDisponiveis(3);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Erro 404</p>
        <h1 className="mt-4 font-display h-section text-ink">
          Esta página já não <span className="italic text-gold">existe</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          O mais provável é a viatura já ter sido vendida. Estas estão
          disponíveis agora — ou fale connosco e procuramos o que precisa.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BotaoLink href="/viaturas">Ver todas as viaturas</BotaoLink>
          <a
            href={stand.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright"
          >
            Falar no WhatsApp ↗
          </a>
        </div>
      </div>

      {sugestoes.length > 0 && (
        <>
          <div className="hairline mt-16" />
          <h2 className="mt-12 text-center font-display h-sub text-ink">
            Disponíveis <span className="italic text-gold">agora</span>
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sugestoes.map((v) => (
              <CarCard key={v.id} viatura={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
