import { CarCard } from "@/components/car/CarCard";
import { BotaoLink } from "@/components/ui/Botao";
import { Reveal } from "@/components/ui/Reveal";
import { getDestaques } from "@/lib/derivados";

export function Destaques() {
  const destaques = getDestaques();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display h-section text-ink">
              Viaturas em <span className="italic text-gold">destaque</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Uma seleção da casa, verificada ponto a ponto e pronta a entregar.
            </p>
          </div>
          <BotaoLink
            href="/viaturas"
            variante="fantasma"
            className="hidden shrink-0 sm:inline-flex"
          >
            Ver todas →
          </BotaoLink>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destaques.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.08}>
            <CarCard viatura={v} />
          </Reveal>
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <BotaoLink href="/viaturas" variante="contorno">
          Ver todas as viaturas
        </BotaoLink>
      </div>
    </section>
  );
}
