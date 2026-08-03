"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatarNumero, formatarPreco, formatarRegisto } from "@/lib/format";
import { urlViatura } from "@/lib/slug";
import type { Viatura } from "@/lib/types";

const GAP = 24;
const COPIAS = 3; // triplica a lista para o loop infinito sem costura
const LIMIAR_ARRASTO = 6; // px acima do qual é arrasto (e não clique)

function IconeCalendario() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconeCombustivel() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M4 21h11M14 9h3a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3M8 8h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconeKm() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1.4-1.4L18 8M4.5 18a9 9 0 1 1 15 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Badge({ viatura }: { viatura: Viatura }) {
  const t =
    viatura.estadoVenda === "vendido"
      ? { txt: "Vendido", cls: "red-metal-fill text-ink" }
      : viatura.estadoVenda === "reservado"
        ? { txt: "Reservado", cls: "gold-metal-fill text-background" }
        : viatura.ivaDedutivel
          ? {
              txt: "IVA Dedutível",
              cls: "border border-gold/60 bg-background/70 text-champagne",
            }
          : null;
  if (!t) return null;
  return (
    <span
      className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur ${t.cls}`}
    >
      {t.txt}
    </span>
  );
}

/**
 * Carrossel "coverflow" das viaturas em destaque: a viatura central fica
 * nítida e as laterais recuadas e desfocadas. Arrastável, com loop infinito.
 */
export function DestaquesCarrossel({ destaques }: { destaques: Viatura[] }) {
  const n = destaques.length;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ card: 0, container: 0 });

  // índice na lista estendida (arranca na cópia do meio)
  const [activo, setActivo] = useState(n);
  const [arrastoPx, setArrastoPx] = useState(0);
  const [aArrastar, setAArrastar] = useState(false);
  const [semTransicao, setSemTransicao] = useState(false);

  const inicioX = useRef(0);
  const moveu = useRef(false);
  const ativoPonteiro = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const medir = () => {
      const container = el.clientWidth;
      const card = Math.min(460, Math.round(container * 0.8));
      setDims({ card, container });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // recentra na banda do meio quando a transição termina (loop sem costura)
  useEffect(() => {
    if (semTransicao) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setSemTransicao(false)),
      );
      return () => cancelAnimationFrame(id);
    }
  }, [semTransicao]);

  if (n === 0) return null;

  const estendido = Array.from({ length: COPIAS }, () => destaques).flat();
  const step = dims.card + GAP;
  const translate =
    dims.container / 2 - dims.card / 2 - activo * step + arrastoPx;

  const recentrar = () => {
    if (aArrastar) return;
    if (activo < n || activo >= 2 * n) {
      setSemTransicao(true);
      setActivo(n + (((activo - n) % n) + n) % n);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!dims.card) return;
    ativoPonteiro.current = true;
    moveu.current = false;
    inicioX.current = e.clientX;
    setAArrastar(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!ativoPonteiro.current) return;
    const dx = e.clientX - inicioX.current;
    if (Math.abs(dx) > LIMIAR_ARRASTO) moveu.current = true;
    setArrastoPx(dx);
  };
  const terminarArrasto = (e: React.PointerEvent) => {
    if (!ativoPonteiro.current) return;
    ativoPonteiro.current = false;
    const dx = e.clientX - inicioX.current;
    const passos = Math.round(-dx / step);
    setArrastoPx(0);
    setAArrastar(false);
    if (passos !== 0) setActivo((a) => a + passos);
  };

  const dotAtivo = ((activo % n) + n) % n;

  return (
    <div className="mt-12">
      <div ref={wrapRef} className="relative overflow-hidden">
        {/* setas */}
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => setActivo((a) => a - 1)}
          className="absolute left-1 top-[38%] z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl font-thin text-ink/70 transition-colors hover:text-gold-bright sm:left-4"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Seguinte"
          onClick={() => setActivo((a) => a + 1)}
          className="absolute right-1 top-[38%] z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl font-thin text-ink/70 transition-colors hover:text-gold-bright sm:right-4"
        >
          ›
        </button>

        {/* trilho arrastável */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={terminarArrasto}
          onPointerCancel={terminarArrasto}
          onTransitionEnd={recentrar}
          onDragStart={(e) => e.preventDefault()}
          style={{
            gap: GAP,
            transform: `translateX(${translate}px)`,
            touchAction: "pan-y",
          }}
          className={`flex select-none items-center ${
            aArrastar ? "cursor-grabbing" : "cursor-grab"
          } ${
            aArrastar || semTransicao
              ? ""
              : "transition-transform duration-500 ease-out"
          }`}
        >
          {estendido.map((v, i) => {
            const central = i === activo;
            const href = urlViatura(v);
            const vendido = v.estadoVenda === "vendido";
            const copia = Math.floor(i / n);
            return (
              <div
                key={`${copia}-${v.id}`}
                onClick={() => !moveu.current && !central && setActivo(i)}
                style={{ width: dims.card || undefined }}
                className={`shrink-0 transition-[transform,opacity,filter] duration-500 ease-out ${
                  central
                    ? "z-10 scale-100 opacity-100"
                    : "scale-[0.82] opacity-35 blur-[2px]"
                }`}
              >
                <article
                  className={central ? "" : "pointer-events-none"}
                  onClickCapture={(e) => {
                    if (moveu.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  {/* foto */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line/60 bg-surface">
                    <Badge viatura={v} />
                    <Link
                      href={href}
                      aria-label={`${v.marca} ${v.modelo}`}
                      draggable={false}
                    >
                      <Image
                        src={v.fotos[0]}
                        alt={`${v.marca} ${v.modelo}`}
                        fill
                        draggable={false}
                        sizes="(max-width: 640px) 80vw, 460px"
                        priority={i < COPIAS}
                        className={`object-cover ${
                          vendido ? "opacity-70 saturate-50" : ""
                        }`}
                      />
                    </Link>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-4 text-[13px] font-medium text-champagne">
                      <span className="flex items-center gap-1.5">
                        <span className="text-gold">
                          <IconeCalendario />
                        </span>
                        {formatarRegisto(v.registoMes, v.registoAno)}
                      </span>
                      <span className="h-4 w-px bg-line" />
                      <span className="flex items-center gap-1.5">
                        <span className="text-gold">
                          <IconeCombustivel />
                        </span>
                        {v.combustivel}
                      </span>
                      <span className="h-4 w-px bg-line" />
                      <span className="flex items-center gap-1.5">
                        <span className="text-gold">
                          <IconeKm />
                        </span>
                        {vendido ? "—" : formatarNumero(v.quilometros)}
                      </span>
                    </div>
                  </div>

                  {/* painel */}
                  <div className="relative mx-2 -mt-1 rounded-b-2xl bg-surface px-6 pb-6 pt-6">
                    <Link href={href} className="block" draggable={false}>
                      <h3 className="font-display text-2xl leading-tight text-ink transition-colors hover:text-gold-bright">
                        {v.marca}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-base text-muted">
                        {v.modelo} {v.versao}
                      </p>
                      <p className="mt-5 text-[11px] uppercase tracking-[0.14em] text-muted">
                        Preço
                      </p>
                      <p className="mt-0.5 font-display text-2xl text-gold">
                        {vendido ? "Vendido" : formatarPreco(v.preco)}
                      </p>
                    </Link>
                    <Link
                      href={href}
                      aria-label="Ver detalhes"
                      draggable={false}
                      className="absolute bottom-5 right-5 flex h-9 w-14 items-center justify-center rounded-full bg-raised text-lg text-muted transition-colors hover:bg-gold hover:text-background"
                    >
                      →
                    </Link>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* pontos */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {destaques.map((v, i) => (
          <button
            key={v.id}
            type="button"
            aria-label={`Ver viatura ${i + 1}`}
            aria-current={i === dotAtivo}
            onClick={() => setActivo((a) => Math.floor(a / n) * n + i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === dotAtivo ? "w-6 bg-gold" : "w-2 bg-line hover:bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
