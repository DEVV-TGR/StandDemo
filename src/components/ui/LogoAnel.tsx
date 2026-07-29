"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const TAMANHOS = {
  grande: { caixa: 280, logo: 196 },
  pequeno: { caixa: 132, logo: 92 },
} as const;

/** Logótipo com anel dourado a girar — base visual dos ecrãs de carregamento. */
export function LogoAnel({
  tamanho = "grande",
  prioridade = false,
}: {
  tamanho?: keyof typeof TAMANHOS;
  prioridade?: boolean;
}) {
  const reduzido = useReducedMotion();
  const { caixa, logo } = TAMANHOS[tamanho];

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: caixa, height: caixa }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        aria-hidden
        className="absolute inset-0 h-full w-full"
        animate={reduzido ? undefined : { rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--line)"
          strokeWidth="1.25"
        />
        {/* arco dourado — ~25% da circunferência (2πr ≈ 289) */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="72 217"
        />
      </motion.svg>

      <motion.div
        animate={reduzido ? undefined : { opacity: [0.72, 1, 0.72] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/logo/imperio-mark-sm.png"
          alt=""
          width={440}
          height={232}
          priority={prioridade}
          style={{ width: logo }}
          className="h-auto"
        />
      </motion.div>
    </div>
  );
}
