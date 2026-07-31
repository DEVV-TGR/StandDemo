"use client";

import { useActionState } from "react";
import { autenticar, type EstadoLogin } from "@/app/admin/auth-actions";

const estadoInicial: EstadoLogin = {};

export function LoginForm() {
  const [estado, formAction, pendente] = useActionState(
    autenticar,
    estadoInicial,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs uppercase tracking-widest text-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full border border-line bg-background px-4 py-3 text-ink outline-none transition-colors focus:border-gold"
          placeholder="admin@exemplo.pt"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-xs uppercase tracking-widest text-muted"
        >
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full border border-line bg-background px-4 py-3 text-ink outline-none transition-colors focus:border-gold"
          placeholder="••••••••"
        />
      </div>

      {estado.erro && (
        <p
          className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="gold-metal-fill w-full px-6 py-3 text-sm font-medium tracking-wide text-background transition-opacity disabled:opacity-60"
      >
        {pendente ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
