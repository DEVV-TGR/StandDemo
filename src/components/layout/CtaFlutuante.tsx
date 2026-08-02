"use client";

import { useEffect, useState } from "react";
import { stand } from "@/data/stand";

/** Botão "Fale agora" que aparece depois de algum scroll. */
export function CtaFlutuante() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoScroll = () => setVisivel(window.scrollY > 480);
    aoScroll();
    window.addEventListener("scroll", aoScroll, { passive: true });
    return () => window.removeEventListener("scroll", aoScroll);
  }, []);

  return (
    <a
      href={`tel:+351${stand.telemovel.replaceAll(" ", "")}`}
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-background shadow-lg shadow-black/40 transition-all duration-300 hover:bg-gold-bright ${
        visivel ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-background/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-background" />
      </span>
      Fale agora
    </a>
  );
}
