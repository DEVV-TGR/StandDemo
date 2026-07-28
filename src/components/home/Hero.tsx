import Image from "next/image";
import { HeroSearch } from "@/components/home/HeroSearch";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section className="grain relative flex min-h-[92svh] items-center overflow-hidden">
      <Image
        src="/cars/audi-rs6-avant/01.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="kenburns object-cover object-center"
      />
      {/* véus para legibilidade sobre a foto */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Stand de automóveis premium
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 font-display h-hero text-ink">
              Que viatura
              <br />
              <span className="italic text-gold-metal">procura?</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Viaturas usadas e seminovas selecionadas a dedo, com histórico
              documentado e garantia incluída.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-9">
            <HeroSearch />
          </Reveal>
        </div>
      </div>

      <div className="hairline absolute inset-x-0 bottom-0" />
    </section>
  );
}
