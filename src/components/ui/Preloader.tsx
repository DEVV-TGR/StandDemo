"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogoAnel } from "@/components/ui/LogoAnel";

const MINIMO_MS = 1200; // tempo mínimo em ecrã, para a marca se ler
const LIMITE_MS = 3000; // rede de segurança: nunca deixar o ecrã preso

/** Ecrã de abertura do site: fundo preto com o logótipo e o anel dourado. */
export function Preloader() {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const inicio = performance.now();
    const temporizadores: number[] = [];
    let agendado = false;

    const esconder = () => {
      if (agendado) return;
      agendado = true;
      const restante = Math.max(0, MINIMO_MS - (performance.now() - inicio));
      temporizadores.push(
        window.setTimeout(() => setVisivel(false), restante),
      );
    };

    if (document.readyState === "complete") esconder();
    else window.addEventListener("load", esconder);

    temporizadores.push(window.setTimeout(esconder, LIMITE_MS));

    return () => {
      window.removeEventListener("load", esconder);
      temporizadores.forEach(window.clearTimeout);
    };
  }, []);

  // trava o scroll enquanto o ecrã está visível
  useEffect(() => {
    if (!visivel) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [visivel]);

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <LogoAnel tamanho="grande" prioridade />
          <span className="sr-only">A carregar</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
