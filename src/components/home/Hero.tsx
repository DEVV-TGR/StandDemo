import Image from "next/image";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { Viatura } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_NAME } from "@/lib/site";

export function Hero({ viaturas }: { viaturas: Viatura[] }) {
  return (
    <section className="grain relative flex min-h-[92svh] items-center overflow-hidden">
      {/*
        O showroom, e não uma viatura.

        Uma foto de carro no hero compete com o catálogo que está logo a
        seguir; o espaço com o logótipo na parede diz quem é o stand antes de
        dizer o que vende — e é a única imagem do site que não pode ser
        substituída pelo painel, porque não é inventário.

        `object-left` porque o interesse está à esquerda (o GT3 RS e a parede
        com o logótipo) e o texto assenta por cima do véu escuro desse lado.
      */}
      <Image
        src="/hero/showroom.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="kenburns object-cover object-center sm:object-left"
      />
      {/* véus para legibilidade sobre a foto */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <div className="max-w-2xl">
          {/* O H1 visível é uma pergunta: bom em UX, nulo em semântica — não diz
              o nome do negócio, a categoria nem a localidade. O H1 real fica
              acessível a leitores de ecrã e ao Google; a pergunta desce a <p>
              sem perder um grama de peso visual. */}
          <h1 className="sr-only">
            {SITE_NAME} — stand de carros usados e seminovos premium no Porto
          </h1>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Stand de automóveis premium
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 font-display h-hero text-ink">
              Que viatura
              <br />
              <span className="italic text-gold-metal">procura?</span>
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Viaturas usadas e seminovas selecionadas a dedo, com histórico
              documentado e garantia incluída.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-9">
            <HeroSearch viaturas={viaturas} />
          </Reveal>
        </div>
      </div>

      <div className="hairline absolute inset-x-0 bottom-0" />
    </section>
  );
}
