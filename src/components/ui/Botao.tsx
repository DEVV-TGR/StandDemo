import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "dourado" | "contorno" | "fantasma";

const estilos: Record<Variante, string> = {
  dourado: "gold-metal-fill text-background font-medium",
  contorno:
    "border border-gold/40 text-champagne hover:border-gold hover:text-gold-bright",
  fantasma: "text-muted hover:text-gold-bright",
};

// `press` trata da transição (cor, brilho e escala) — ver globals.css
const base =
  "press inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide cursor-pointer select-none";

export function BotaoLink({
  variante = "dourado",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; children: ReactNode }) {
  return (
    <Link {...props} className={`${base} ${estilos[variante]} ${className}`}>
      {children}
    </Link>
  );
}

export function Botao({
  variante = "dourado",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variante?: Variante; children: ReactNode }) {
  return (
    <button {...props} className={`${base} ${estilos[variante]} ${className}`}>
      {children}
    </button>
  );
}
