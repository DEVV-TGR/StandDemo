"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/car/Lightbox";

export function Gallery({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [ativa, setAtiva] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line/60 bg-surface"
        aria-label="Abrir galeria em ecrã inteiro"
      >
        <Image
          src={fotos[ativa]}
          alt={`${alt} — foto ${ativa + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-background/70 px-3 py-1.5 text-xs tracking-[0.15em] text-champagne backdrop-blur">
          {fotos.length} Fotos ⤢
        </span>
      </button>

      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {fotos.map((f, i) => (
          <button
            key={f}
            type="button"
            onClick={() => setAtiva(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition-all duration-200 ${
              i === ativa
                ? "border-gold"
                : "border-line/60 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={f}
              alt=""
              fill
              sizes="(max-width: 640px) 25vw, 120px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <Lightbox
        fotos={fotos}
        alt={alt}
        indice={ativa}
        aberto={lightbox}
        onFechar={() => setLightbox(false)}
        onNavegar={setAtiva}
      />
    </div>
  );
}
