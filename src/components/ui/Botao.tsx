import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "dourado" | "contorno" | "fantasma";

const estilos: Record<Variante, string> = {
  dourado:
    "bg-gold text-background hover:bg-gold-bright active:bg-gold-deep font-medium",
  contorno:
    "border border-gold/40 text-champagne hover:border-gold hover:text-gold-bright",
  fantasma: "text-muted hover:text-gold-bright",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide transition-colors duration-200 cursor-pointer select-none";

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
