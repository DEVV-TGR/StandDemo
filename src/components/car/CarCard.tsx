"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { BadgeEstado } from "@/components/car/BadgeEstado";
import {
  formatarKm,
  formatarPreco,
  formatarRegisto,
} from "@/lib/format";
import { urlViatura } from "@/lib/slug";
import type { Viatura } from "@/lib/types";

export function CarCard({
  viatura,
  prioridade = false,
}: {
  viatura: Viatura;
  prioridade?: boolean;
}) {
  const total = viatura.fotos.length;
  /*
    A capa é a primeira foto — a que estiver em primeiro lugar no painel.

    Isto abria na segunda (índice 1) por uma razão que deixou de existir: as
    fotos vinham dos anúncios do StandVirtual, onde a primeira é sempre o mesmo
    ângulo de frente, e saltá-la dava variedade à grelha. Agora que a ordem se
    escolhe no painel, esse truque passa a contrariar quem a escolheu — quem
    põe uma foto em primeiro lugar espera vê-la na capa.
  */
  const inicial = 0;
  const [foto, setFoto] = useState(inicial);
  const vendido = viatura.estadoVenda === "vendido";

  const mudar = (delta: number) => {
    setFoto((f) => (f + delta + total) % total);
  };

  // arrasto/deslize horizontal para mudar de foto (além das setas)
  const inicioX = useRef(0);
  const moveu = useRef(false);
  const ativoPonteiro = useRef(false);
  const capturado = useRef(false);
  const LIMIAR_MOVE = 6; // px acima do qual é arrasto (e não clique)
  const LIMIAR_SWIPE = 40; // px para trocar de foto

  const onPointerDown = (e: React.PointerEvent) => {
    if (total <= 1) return;
    ativoPonteiro.current = true;
    moveu.current = false;
    capturado.current = false;
    inicioX.current = e.clientX;
    /*
      Sem `setPointerCapture` já: capturar o ponteiro aqui redirecionava o
      `pointerup` para esta caixa, e o browser deixava de gerar o `click` nas
      setas lá dentro — carregar em ‹ › não passava a foto. A captura só é
      precisa quando isto passa mesmo a ser um arrasto, e é aí que se faz.
    */
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!ativoPonteiro.current) return;
    if (Math.abs(e.clientX - inicioX.current) <= LIMIAR_MOVE) return;
    moveu.current = true;
    // a partir daqui é arrasto: agarra o ponteiro para o dedo poder sair da
    // caixa sem se perder o fim do gesto
    if (!capturado.current) {
      capturado.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const terminarArrasto = (e: React.PointerEvent) => {
    if (!ativoPonteiro.current) return;
    ativoPonteiro.current = false;
    capturado.current = false;
    const dx = e.clientX - inicioX.current;
    if (Math.abs(dx) > LIMIAR_SWIPE) mudar(dx < 0 ? 1 : -1);
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line/60 bg-surface transition-colors duration-300 hover:border-gold/50">
      <div
        className={`relative aspect-[4/3] overflow-hidden ${
          total > 1 ? "cursor-grab touch-pan-y select-none active:cursor-grabbing" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={terminarArrasto}
        onPointerCancel={terminarArrasto}
      >
        <BadgeEstado viatura={viatura} />
        <Link
          href={urlViatura(viatura)}
          tabIndex={-1}
          aria-hidden
          draggable={false}
          onClickCapture={(e) => {
            if (moveu.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <Image
            src={viatura.fotos[foto]}
            alt={`${viatura.marca} ${viatura.modelo} — foto ${foto + 1}`}
            fill
            draggable={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={prioridade && foto === inicial}
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              vendido ? "opacity-60 saturate-50" : ""
            }`}
          />
        </Link>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => mudar(-1)}
              className="press absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/60 text-ink backdrop-blur hover:bg-background/85 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Foto seguinte"
              onClick={() => mudar(1)}
              className="press absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/60 text-ink backdrop-blur hover:bg-background/85 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {viatura.fotos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-4 rounded-full transition-colors duration-200 ${
                    i === foto ? "bg-gold" : "bg-ink/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Link href={urlViatura(viatura)} className="block p-5">
        <p className="flex flex-wrap items-center gap-x-2 text-xs uppercase tracking-[0.15em] text-muted">
          <span>{formatarRegisto(viatura.registoMes, viatura.registoAno)}</span>
          <span className="text-gold-deep">·</span>
          <span>{viatura.combustivel}</span>
          <span className="text-gold-deep">·</span>
          <span>{formatarKm(viatura.quilometros)}</span>
        </p>
        <h3 className="mt-2 font-display text-xl text-ink transition-colors group-hover:text-gold-bright">
          {viatura.marca} {viatura.modelo}
        </h3>
        <p className="text-sm text-muted">{viatura.versao}</p>
        <p className="mt-3 font-display text-2xl text-gold">
          {vendido ? "Vendido" : formatarPreco(viatura.preco)}
        </p>
      </Link>
    </article>
  );
}
