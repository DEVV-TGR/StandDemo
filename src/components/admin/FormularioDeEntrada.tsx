"use client";

import { useActionState } from "react";
import { pedirCodigo, type EstadoDaEntrada } from "@/app/admin/acoes-entrada";

const INICIAL: EstadoDaEntrada = {};

export function FormularioDeEntrada() {
  const [estado, accao, aPedir] = useActionState(pedirCodigo, INICIAL);

  return (
    <form action={accao} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          autoFocus
          disabled={aPedir}
          placeholder="o.seu@email.pt"
          className="w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-60"
        />
      </label>

      {estado.erro && (
        <p role="alert" className="text-sm leading-relaxed text-red-bright">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={aPedir}
        className="gold-metal-fill press w-full rounded-full px-6 py-3 text-sm font-medium text-background disabled:opacity-60"
      >
        {aPedir ? "A enviar…" : "Receber código"}
      </button>
    </form>
  );
}
