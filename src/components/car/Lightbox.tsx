"use client";

import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Lightbox({
  fotos,
  alt,
  indice,
  aberto,
  onFechar,
  onNavegar,
}: {
  fotos: string[];
  alt: string;
  indice: number;
  aberto: boolean;
  onFechar: () => void;
  onNavegar: (novo: number) => void;
}) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowRight") onNavegar((indice + 1) % fotos.length);
      if (e.key === "ArrowLeft")
        onNavegar((indice - 1 + fotos.length) % fotos.length);
    };
    window.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberto, indice, fotos.length, onFechar, onNavegar]);

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal
          aria-label={`Galeria de fotos — ${alt}`}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm text-muted">
              <span className="text-gold">{indice + 1}</span> / {fotos.length}
            </p>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar galeria"
              className="press flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink hover:border-gold hover:text-gold"
            >
              ✕
            </button>
          </div>

          <div className="relative flex-1">
            <motion.div
              key={indice}
              className="absolute inset-0 m-4 sm:m-8"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) onNavegar((indice + 1) % fotos.length);
                if (info.offset.x > 80)
                  onNavegar((indice - 1 + fotos.length) % fotos.length);
              }}
            >
              <Image
                src={fotos[indice]}
                alt={`${alt} — foto ${indice + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>

            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => onNavegar((indice - 1 + fotos.length) % fotos.length)}
              className="press absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-background/70 text-xl text-ink backdrop-blur hover:border-gold hover:text-gold"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Foto seguinte"
              onClick={() => onNavegar((indice + 1) % fotos.length)}
              className="press absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-background/70 text-xl text-ink backdrop-blur hover:border-gold hover:text-gold"
            >
              ›
            </button>
          </div>

          <div className="flex justify-center gap-2 overflow-x-auto px-5 py-4">
            {fotos.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => onNavegar(i)}
                aria-label={`Ir para a foto ${i + 1}`}
                className={`press relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border ${
                  i === indice ? "border-gold" : "border-line opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={f}
                  alt={`${alt} — miniatura ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
