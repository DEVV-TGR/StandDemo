import type { Viatura, VarianteVendido } from "@/lib/types";

// estilo do badge "Vendido" conforme a variante escolhida (demo para o cliente).
export function classeVendido(variante?: VarianteVendido): string {
  switch (variante) {
    case "vermelho":
      return "bg-red text-ink";
    case "verde-metal":
      return "green-metal-fill text-background";
    case "vermelho-metal":
      return "red-metal-fill text-ink";
    default:
      return "bg-green text-background"; // verde liso
  }
}

export function BadgeEstado({ viatura }: { viatura: Viatura }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
      {viatura.estadoVenda === "vendido" && (
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)] ${classeVendido(
            viatura.varianteVendido
          )}`}
        >
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
