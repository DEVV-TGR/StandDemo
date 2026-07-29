"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoAnel } from "@/components/ui/LogoAnel";

const MINIMO_MS = 600; // curto: marca a transição sem travar a navegação
const LIMITE_MS = 3000; // rede de segurança se a rota nunca chegar

/** Ecrã breve entre páginas, disparado por src/instrumentation-client.ts. */
export function TransicaoRota() {
  const [visivel, setVisivel] = useState(false);
  const inicio = useRef(0);
  const destino = useRef<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const aoIniciar = (evento: Event) => {
      const url = (evento as CustomEvent<{ url?: string }>).detail?.url;
      const caminho = url
        ? new URL(url, window.location.origin).pathname
        : null;

      // mesma página (ex.: "/#contactos" estando em "/") — é só descer,
      // deixa-se a animação de scroll fazer o seu trabalho
      if (caminho !== null && caminho === window.location.pathname) return;

      destino.current = caminho;
      inicio.current = performance.now();
      setVisivel(true);
    };

    window.addEventListener("rota:inicio", aoIniciar);
    return () => window.removeEventListener("rota:inicio", aoIniciar);
  }, []);

  useEffect(() => {
    if (!visivel) return;

    // já chegámos ao destino? (destino desconhecido = não esperar por ele)
    const chegou = destino.current === null || pathname === destino.current;
    const decorrido = performance.now() - inicio.current;
    const espera = chegou
      ? Math.max(0, MINIMO_MS - decorrido)
      : Math.max(0, LIMITE_MS - decorrido);

    const temporizador = window.setTimeout(() => setVisivel(false), espera);
    return () => window.clearTimeout(temporizador);
  }, [visivel, pathname]);

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          key="transicao"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: "linear" }}
        >
          <LogoAnel tamanho="pequeno" />
          <span className="sr-only">A carregar página</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
