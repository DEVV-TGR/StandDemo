"use client";

import { useActionState, useState, useTransition } from "react";
import {
  confirmarCodigo,
  reenviarCodigo,
  type EstadoDoCodigo,
} from "@/app/admin/acoes-entrada";

const INICIAL: EstadoDoCodigo = {};

export function FormularioDeCodigo({ paraOnde }: { paraOnde: string }) {
  const [estado, accao, aConfirmar] = useActionState(confirmarCodigo, INICIAL);
  const [reenvio, setReenvio] = useState<EstadoDoCodigo>({});
  const [aReenviar, iniciarReenvio] = useTransition();

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        Enviámos um código de 6 algarismos para <strong className="text-ink">{paraOnde}</strong>.
        Está no assunto do email.
      </p>

      <form action={accao} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted">
            Código
          </span>
          <input
            type="text"
            name="codigo"
            required
            /* `one-time-code` faz o iOS e o Android oferecerem o código lido da
               notificação, sem a pessoa ter de sair do ecrã para o copiar. */
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9\s]*"
            maxLength={7}
            autoFocus
            disabled={aConfirmar}
            placeholder="000 000"
            className="w-full rounded-xl border border-line bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-ink outline-none transition-colors focus:border-gold disabled:opacity-60"
          />
        </label>

        {estado.erro && (
          <p role="alert" className="text-sm leading-relaxed text-red-bright">
            {estado.erro}
          </p>
        )}
        {reenvio.erro && (
          <p role="alert" className="text-sm leading-relaxed text-red-bright">
            {reenvio.erro}
          </p>
        )}
        {reenvio.reenviado && (
          <p role="status" className="text-sm leading-relaxed text-sucesso">
            Enviámos outro código. O anterior deixou de servir.
          </p>
        )}

        <button
          type="submit"
          disabled={aConfirmar}
          className="gold-metal-fill press w-full rounded-full px-6 py-3 text-sm font-medium text-background disabled:opacity-60"
        >
          {aConfirmar ? "A confirmar…" : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        disabled={aReenviar}
        onClick={() =>
          iniciarReenvio(async () => setReenvio(await reenviarCodigo()))
        }
        className="w-full text-xs text-muted underline-offset-4 transition-colors hover:text-gold-bright hover:underline disabled:opacity-60"
      >
        {aReenviar ? "A enviar…" : "Não recebi o código — enviar outro"}
      </button>
    </div>
  );
}
