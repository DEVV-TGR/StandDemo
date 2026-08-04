"use client";

import { useState } from "react";
import { stand } from "@/data/stand";
import { formatarKm, formatarPreco, formatarRegisto } from "@/lib/format";
import type { Viatura } from "@/lib/types";

export function StickyCard({ viatura }: { viatura: Viatura }) {
  const [copiado, setCopiado] = useState(false);
  const vendido = viatura.estadoVenda === "vendido";

  const partilhar = async () => {
    const url = window.location.href;
    const titulo = `${viatura.marca} ${viatura.modelo} ${viatura.versao}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        /* cancelado pelo utilizador */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-line/60 bg-surface p-7 lg:sticky lg:top-24">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        {formatarRegisto(viatura.registoMes, viatura.registoAno)} ·{" "}
        {formatarKm(viatura.quilometros)}
      </p>
      <p className="mt-3 font-display text-4xl text-gold">
        {vendido ? "Vendido" : formatarPreco(viatura.preco)}
      </p>
      {viatura.ivaDedutivel && !vendido && (
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-champagne">
          IVA dedutível
        </p>
      )}
      {viatura.estadoVenda === "reservado" && (
        <p className="mt-2 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-background">
          Reservado
        </p>
      )}

      <div className="hairline my-6" />

      <div className="space-y-3">
        <a
          href={`tel:+351${stand.telemovel.replaceAll(" ", "")}`}
          className="gold-metal-fill press block w-full rounded-full px-6 py-3.5 text-center text-sm font-medium tracking-wide text-background"
        >
          Ligar {stand.telemovel}
        </a>
        <a
          href={`${stand.whatsapp}?text=${encodeURIComponent(
            `Olá! Tenho interesse na viatura ${viatura.marca} ${viatura.modelo} ${viatura.versao} (ref. ${viatura.id}).`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="press block w-full rounded-full border border-gold/40 px-6 py-3.5 text-center text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright"
        >
          Falar no WhatsApp
        </a>
        <a
          href={`mailto:${stand.email}?subject=${encodeURIComponent(
            `Interesse: ${viatura.marca} ${viatura.modelo} (${viatura.id})`,
          )}`}
          className="press block w-full rounded-full border border-gold/40 px-6 py-3.5 text-center text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright"
        >
          Pedir contacto
        </a>
      </div>

      <div className="mt-5 flex justify-center gap-6 text-xs text-muted">
        <button
          type="button"
          onClick={partilhar}
          className="press hover:text-gold-bright"
        >
          {copiado ? "Ligação copiada ✓" : "Partilhar"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="press hover:text-gold-bright"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}
