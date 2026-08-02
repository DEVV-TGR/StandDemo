import type { Viatura } from "@/lib/types";

export function BadgeEstado({ viatura }: { viatura: Viatura }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
      {viatura.estadoVenda === "vendido" && (
        <span className="rounded-full bg-background/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-muted backdrop-blur">
          Vendido
        </span>
      )}
      {viatura.estadoVenda === "reservado" && (
        <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-background">
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
