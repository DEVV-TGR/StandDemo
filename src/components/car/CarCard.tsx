"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeEstado } from "@/components/car/BadgeEstado";
import {
  formatarKm,
  formatarPreco,
  formatarRegisto,
} from "@/lib/format";
import { urlViatura } from "@/lib/slug";
import type { Viatura } from "@/lib/types";

export function CarCard({
  viatura,
  prioridade = false,
}: {
  viatura: Viatura;
  prioridade?: boolean;
}) {
  const total = viatura.fotos.length;
  // miniatura abre na 2ª foto (índice 1); a página dedicada é que mostra a 1ª
  const inicial = total > 1 ? 1 : 0;
  const [foto, setFoto] = useState(inicial);
  const vendido = viatura.estadoVenda === "vendido";

  const mudar = (delta: number) => {
    setFoto((f) => (f + delta + total) % total);
  };

  return (
    <article className="group relative border border-line/60 bg-surface transition-colors duration-300 hover:border-gold/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <BadgeEstado viatura={viatura} />
        <Link href={urlViatura(viatura)} tabIndex={-1} aria-hidden>
          <Image
            src={viatura.fotos[foto]}
            alt={`${viatura.marca} ${viatura.modelo} — foto ${foto + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={prioridade && foto === inicial}
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              vendido ? "opacity-60 saturate-50" : ""
            }`}
          />
        </Link>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => mudar(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-background/60 text-ink backdrop-blur transition-opacity duration-200 hover:bg-background/85 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Foto seguinte"
              onClick={() => mudar(1)}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-background/60 text-ink backdrop-blur transition-opacity duration-200 hover:bg-background/85 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {viatura.fotos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-4 transition-colors duration-200 ${
                    i === foto ? "bg-gold" : "bg-ink/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Link href={urlViatura(viatura)} className="block p-5">
        <p className="flex flex-wrap items-center gap-x-2 text-xs uppercase tracking-[0.15em] text-muted">
          <span>{formatarRegisto(viatura.registoMes, viatura.registoAno)}</span>
          <span className="text-gold-deep">·</span>
          <span>{viatura.combustivel}</span>
          <span className="text-gold-deep">·</span>
          <span>{formatarKm(viatura.quilometros)}</span>
        </p>
        <h3 className="mt-2 font-display text-xl text-ink transition-colors group-hover:text-gold-bright">
          {viatura.marca} {viatura.modelo}
        </h3>
        <p className="text-sm text-muted">{viatura.versao}</p>
        <p className="mt-3 font-display text-2xl text-gold">
          {vendido ? "Vendido" : formatarPreco(viatura.preco)}
        </p>
      </Link>
    </article>
  );
}
