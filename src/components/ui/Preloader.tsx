"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const MINIMO_MS = 1100; // tempo mínimo em ecrã, para a marca se ler
const LIMITE_MS = 3000; // rede de segurança: nunca deixar o ecrã preso
const SAIDA_MS = 1150; // duração do zoom final

/* O logo é desenhado já em tamanho grande e começa reduzido por scale(), para o
   fotograma final sair nítido. Como ambas as medidas são em vmax, o rácio de
   repouso é constante — sem medições em JS e sem hydration mismatch. */
const LARGURA_VMAX = 135;
const REPOUSO_VMAX = 14;
const ESCALA_REPOUSO = REPOUSO_VMAX / LARGURA_VMAX;

type Fase = "espera" | "saida" | "fora";

/** Ecrã de abertura: o logótipo cresce até encher a página e revela o site. */
export function Preloader() {
  const [fase, setFase] = useState<Fase>("espera");
  const reduzido = useReducedMotion();

  useEffect(() => {
    const inicio = performance.now();
    const temporizadores: number[] = [];
    let agendado = false;

    const sair = () => {
      if (agendado) return;
      agendado = true;
      const restante = Math.max(0, MINIMO_MS - (performance.now() - inicio));
      // a desmontagem é comandada por temporizador (não pelo fim da animação)
      temporizadores.push(window.setTimeout(() => setFase("saida"), restante));
      temporizadores.push(
        window.setTimeout(() => setFase("fora"), restante + SAIDA_MS),
      );
    };

    if (document.readyState === "complete") sair();
    else window.addEventListener("load", sair);

    temporizadores.push(window.setTimeout(sair, LIMITE_MS));

    return () => {
      window.removeEventListener("load", sair);
      temporizadores.forEach(window.clearTimeout);
    };
  }, []);

  // trava o scroll enquanto o ecrã está visível
  useEffect(() => {
    if (fase === "fora") return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [fase]);

  if (fase === "fora") return null;

  const aSair = fase === "saida";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* o preto recua primeiro, revelando o site por trás do logo a crescer */}
      <motion.div
        className="absolute inset-0 bg-background"
        animate={{ opacity: aSair ? 0 : 1 }}
        transition={{
          duration: aSair ? (SAIDA_MS / 1000) * 0.5 : 0,
          delay: aSair ? (SAIDA_MS / 1000) * 0.35 : 0,
          ease: "linear",
        }}
      />

      {/* centrado à mão: um elemento maior que a viewport não é centrado pelo grid */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ width: `${LARGURA_VMAX}vmax`, x: "-50%", y: "-50%" }}
        initial={{ scale: ESCALA_REPOUSO }}
        animate={{
          scale: reduzido
            ? ESCALA_REPOUSO
            : aSair
              ? 1
              : ESCALA_REPOUSO * 1.07,
          opacity: aSair ? 0 : 1,
        }}
        transition={{
          scale: aSair
            ? { duration: SAIDA_MS / 1000, ease: [0.42, 0, 0.9, 0.6] }
            : { duration: 2.4, ease: "easeOut" },
          opacity: {
            duration: aSair ? (SAIDA_MS / 1000) * 0.45 : 0,
            delay: aSair ? (SAIDA_MS / 1000) * 0.55 : 0,
            ease: "linear",
          },
        }}
      >
        <Image
          src="/logo/imperio-mark-md.png"
          alt=""
          width={1000}
          height={527}
          priority
          className="h-auto w-full"
        />
      </motion.div>
      <span className="sr-only">A carregar</span>
    </div>
  );
}
