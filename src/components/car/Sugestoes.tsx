import { CarCard } from "@/components/car/CarCard";
import { Reveal } from "@/components/ui/Reveal";
import { viaturas } from "@/data/viaturas";
import type { Viatura } from "@/lib/types";

export function Sugestoes({ atual }: { atual: Viatura }) {
  const outras = viaturas.filter((v) => v.id !== atual.id).slice(0, 3);
  if (outras.length === 0) return null;

  return (
    <section className="border-t border-line/60 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="font-display h-sub text-ink">
            Também vai gostar <span className="italic text-gold">destas</span>
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outras.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08}>
              <CarCard viatura={v} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
