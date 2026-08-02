"use client";

import { ORDENACOES, type Ordenacao } from "@/lib/filtros";

export function SortSelect({
  valor,
  onChange,
}: {
  valor: Ordenacao;
  onChange: (v: Ordenacao) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="whitespace-nowrap text-xs uppercase tracking-[0.2em] text-muted">
        Ordenar por
      </span>
      <span className="relative">
        <select
          className="appearance-none rounded-full border border-line bg-surface/80 py-2 pl-4 pr-8 text-sm text-ink outline-none transition-colors focus:border-gold [&>option]:bg-surface"
          value={valor}
          onChange={(e) => onChange(e.target.value as Ordenacao)}
        >
          {ORDENACOES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gold"
        >
          ▾
        </span>
      </span>
    </label>
  );
}
