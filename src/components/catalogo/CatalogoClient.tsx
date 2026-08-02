"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CarCard } from "@/components/car/CarCard";
import { FiltersPanel } from "@/components/catalogo/FiltersPanel";
import { SortSelect } from "@/components/catalogo/SortSelect";
import { viaturas } from "@/data/viaturas";
import {
  filtrarViaturas,
  ordenarViaturas,
  serializeFiltros,
  type Filtros,
} from "@/lib/filtros";
import { formatarKm, formatarPreco } from "@/lib/format";

type Chip = { id: string; rotulo: string; patch: Partial<Filtros> };

function IconeFiltros() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 5h18M6 12h12M10 19h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function intervalo(
  prefixo: string,
  min: number | undefined,
  max: number | undefined,
  fmt: (n: number) => string,
): string {
  const corpo =
    min !== undefined && max !== undefined
      ? `${fmt(min)} – ${fmt(max)}`
      : min !== undefined
        ? `desde ${fmt(min)}`
        : `até ${fmt(max as number)}`;
  return `${prefixo}: ${corpo}`;
}

const nomePorSlug = (campo: "marcaSlug" | "modeloSlug", slug: string) =>
  viaturas.find((v) => v[campo] === slug)?.[
    campo === "marcaSlug" ? "marca" : "modelo"
  ] ?? slug;

export function CatalogoClient({
  filtrosIniciais,
}: {
  filtrosIniciais: Filtros;
}) {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
  const [painelAberto, setPainelAberto] = useState(false);
  const primeiraRender = useRef(true);

  // estado ⇄ URL (replaceState: sem spam de histórico nem round-trips ao servidor)
  useEffect(() => {
    if (primeiraRender.current) {
      primeiraRender.current = false;
      return;
    }
    const qs = serializeFiltros(filtros);
    window.history.replaceState(
      null,
      "",
      qs ? `/viaturas?${qs}` : "/viaturas",
    );
  }, [filtros]);

  const resultados = useMemo(
    () => ordenarViaturas(filtrarViaturas(viaturas, filtros), filtros.ordenar),
    [filtros],
  );

  const limpar = () => setFiltros({ ordenar: filtros.ordenar });

  // Chips dos filtros ativos — dão visibilidade ao que está selecionado sem
  // abrir o painel (útil sobretudo em telemóvel/tablet).
  const chips = useMemo<Chip[]>(() => {
    const lista: Chip[] = [];
    if (filtros.marca)
      lista.push({
        id: "marca",
        rotulo: nomePorSlug("marcaSlug", filtros.marca),
        patch: { marca: undefined, modelo: undefined },
      });
    if (filtros.modelo)
      lista.push({
        id: "modelo",
        rotulo: nomePorSlug("modeloSlug", filtros.modelo),
        patch: { modelo: undefined },
      });
    if (filtros.combustivel)
      lista.push({
        id: "combustivel",
        rotulo: filtros.combustivel,
        patch: { combustivel: undefined },
      });
    if (filtros.transmissao)
      lista.push({
        id: "transmissao",
        rotulo: filtros.transmissao,
        patch: { transmissao: undefined },
      });
    if (filtros.segmento)
      lista.push({
        id: "segmento",
        rotulo: filtros.segmento,
        patch: { segmento: undefined },
      });
    if (filtros.precoMin !== undefined || filtros.precoMax !== undefined)
      lista.push({
        id: "preco",
        rotulo: intervalo("Preço", filtros.precoMin, filtros.precoMax, formatarPreco),
        patch: { precoMin: undefined, precoMax: undefined },
      });
    if (filtros.anoMin !== undefined || filtros.anoMax !== undefined)
      lista.push({
        id: "ano",
        rotulo: intervalo("Ano", filtros.anoMin, filtros.anoMax, String),
        patch: { anoMin: undefined, anoMax: undefined },
      });
    if (filtros.kmMin !== undefined || filtros.kmMax !== undefined)
      lista.push({
        id: "km",
        rotulo: intervalo("Km", filtros.kmMin, filtros.kmMax, formatarKm),
        patch: { kmMin: undefined, kmMax: undefined },
      });
    return lista;
  }, [filtros]);

  const removerChip = (patch: Partial<Filtros>) =>
    setFiltros({ ...filtros, ...patch });

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      {/* filtros — sidebar em desktop, drawer em mobile */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-line/60 bg-surface p-6">
          <FiltersPanel
            filtros={filtros}
            onChange={setFiltros}
            resultados={resultados.length}
            onLimpar={limpar}
          />
        </div>
      </aside>

      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPainelAberto(true)}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm tracking-wide text-champagne transition-colors hover:border-gold hover:text-gold-bright"
          >
            <IconeFiltros />
            Filtros
            {chips.length > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-medium text-background">
                {chips.length}
              </span>
            )}
          </button>
          <p className="text-sm text-muted" aria-live="polite">
            {resultados.length}{" "}
            {resultados.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {/* chips dos filtros ativos */}
        {chips.length > 0 && (
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => removerChip(c.patch)}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-champagne transition-colors hover:border-gold hover:text-gold-bright"
                aria-label={`Remover filtro ${c.rotulo}`}
              >
                {c.rotulo}
                <span aria-hidden className="text-gold">
                  ✕
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={limpar}
              className="shrink-0 whitespace-nowrap px-2 py-1.5 text-xs text-muted underline-offset-4 transition-colors hover:text-gold-bright hover:underline"
            >
              Limpar tudo
            </button>
          </div>
        )}

        {painelAberto && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 lg:hidden"
            role="dialog"
            aria-modal
          >
            {/* fundo esbatido — a página continua visível por trás */}
            <button
              type="button"
              aria-label="Fechar filtros"
              onClick={() => setPainelAberto(false)}
              className="absolute inset-0 bg-background/50 backdrop-blur-sm"
            />
            {/* modal centrado horizontalmente */}
            <div className="relative z-10 mt-12 flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/60">
              <div className="flex shrink-0 items-center justify-between border-b border-line/60 px-6 py-4">
                <p className="font-display text-xl text-ink">Filtros</p>
                <button
                  type="button"
                  onClick={() => setPainelAberto(false)}
                  aria-label="Fechar"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-gold hover:text-gold"
                >
                  ✕
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <FiltersPanel
                  filtros={filtros}
                  onChange={setFiltros}
                  resultados={resultados.length}
                  onLimpar={limpar}
                />
              </div>
              <div className="shrink-0 border-t border-line/60 p-4">
                <button
                  type="button"
                  onClick={() => setPainelAberto(false)}
                  className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-gold-bright"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted" aria-live="polite">
            {resultados.length}{" "}
            {resultados.length === 1 ? "viatura encontrada" : "viaturas encontradas"}
          </p>
          <SortSelect
            valor={filtros.ordenar ?? "relevancia"}
            onChange={(o) =>
              setFiltros({
                ...filtros,
                ordenar: o === "relevancia" ? undefined : o,
              })
            }
          />
        </div>

        {resultados.length === 0 ? (
          <div className="rounded-2xl border border-line/60 bg-surface px-8 py-20 text-center">
            <p className="font-display h-sub text-ink">
              Sem resultados <span className="italic text-gold">para já</span>
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Nenhuma viatura corresponde aos parâmetros escolhidos. Ajuste os
              filtros ou fale connosco — encontramos a viatura certa para si.
            </p>
            <button
              type="button"
              onClick={limpar}
              className="mt-6 rounded-full border border-gold/40 px-6 py-3 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright"
            >
              Limpar parâmetros
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {resultados.map((v, i) => (
              <CarCard key={v.id} viatura={v} prioridade={i < 2} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
