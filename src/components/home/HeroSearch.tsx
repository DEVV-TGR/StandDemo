"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Contador } from "@/components/ui/Contador";
import { getCombustiveis, getMarcas, getModelos } from "@/lib/derivados";
import { filtrarViaturas, serializeFiltros } from "@/lib/filtros";
import type { Combustivel, Viatura } from "@/lib/types";

const selectClasses =
  "w-full appearance-none rounded-xl border border-line bg-surface/80 px-4 py-3 pr-10 text-sm text-ink outline-none transition-colors focus:border-gold [&>option]:bg-surface";

function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted">
        {rotulo}
      </span>
      <span className="relative block">
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold"
        >
          ▾
        </span>
      </span>
    </label>
  );
}

export function HeroSearch({ viaturas }: { viaturas: Viatura[] }) {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [combustivel, setCombustivel] = useState("");

  const modelos = useMemo(() => getModelos(viaturas, marca || undefined), [viaturas, marca]);

  const filtros = {
    marca: marca || undefined,
    modelo: modelo || undefined,
    combustivel: (combustivel || undefined) as Combustivel | undefined,
  };
  const resultados = filtrarViaturas(viaturas, filtros).length;

  const pesquisar = () => {
    const qs = serializeFiltros(filtros);
    router.push(qs ? `/viaturas?${qs}` : "/viaturas");
  };

  return (
    <div className="rounded-2xl border border-line/70 bg-background/60 p-6 backdrop-blur-xl sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo rotulo="Marca">
          <select
            className={selectClasses}
            value={marca}
            onChange={(e) => {
              setMarca(e.target.value);
              setModelo("");
            }}
          >
            <option value="">Todas</option>
            {getMarcas(viaturas).map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Modelo">
          <select
            className={selectClasses}
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          >
            <option value="">Todos</option>
            {modelos.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Combustível">
          <select
            className={selectClasses}
            value={combustivel}
            onChange={(e) => setCombustivel(e.target.value)}
          >
            <option value="">Todos</option>
            {getCombustiveis(viaturas).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <button
        type="button"
        onClick={pesquisar}
        className="gold-metal-fill press mt-5 w-full rounded-full px-6 py-3.5 text-sm font-medium tracking-wide text-background"
      >
        Ver <Contador valor={resultados} />{" "}
        {resultados === 1 ? "resultado" : "resultados"}
      </button>
    </div>
  );
}
