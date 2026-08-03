import type { Viatura } from "@/lib/types";

export function BadgeEstado({ viatura }: { viatura: Viatura }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
      {viatura.estadoVenda === "vendido" && (
        <span className="red-metal-fill rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-ink shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]">
          Vendido
        </span>
      )}
      {viatura.estadoVenda === "reservado" && (
        <span className="gold-metal-fill rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-background shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]">
          Reservado
        </span>
      )}
      {viatura.ivaDedutivel && (
        <span className="rounded-full border border-gold/50 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-champagne backdrop-blur">
          IVA Dedutível
        </span>
      )}
    </div>
  );
}
