import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getMarcas } from "@/lib/derivados";
import { urlViaturasPorMarca } from "@/lib/slug";
import type { Viatura } from "@/lib/types";

export function GrelhaMarcas({ viaturas }: { viaturas: Viatura[] }) {
  const marcas = getMarcas(viaturas);

  return (
    <section className="border-y border-line/60 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="font-display h-section text-ink">
            Escolha pela <span className="italic text-gold">marca</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marcas.map((m, i) => {
            const total = viaturas.filter((v) => v.marcaSlug === m.slug).length;
            return (
              <Reveal key={m.slug} delay={i * 0.08}>
                <Link
                  href={urlViaturasPorMarca(m.slug)}
                  className="group flex items-center justify-between rounded-2xl border border-line/60 bg-background px-8 py-10 transition-colors duration-300 hover:border-gold/50"
                >
                  <div>
                    <span className="font-display text-4xl text-ink transition-colors group-hover:text-gold-bright">
                      {m.nome}
                    </span>
                    <p className="mt-2 text-sm text-muted">
                      {total} {total === 1 ? "viatura" : "viaturas"} em stock
                    </p>
                  </div>
                  <span className="font-display text-3xl text-gold transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
