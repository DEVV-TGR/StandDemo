"use client";

import { useTransition } from "react";
import { sair, esquecerEsteAparelho } from "@/app/admin/acoes-entrada";

/*
  Sair fecha a sessão e deixa o aparelho lembrado — na próxima vez entra-se sem
  código. Esquecer o aparelho é o outro botão, e é o que se carrega quando se
  entrou num computador que não é nosso.
*/

export function BotoesDeSessao() {
  const [aSair, iniciarSaida] = useTransition();
  const [aEsquecer, iniciarEsquecimento] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={aSair}
        onClick={() => iniciarSaida(() => void sair())}
        className="press rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-gold hover:text-gold-bright disabled:opacity-60"
      >
        {aSair ? "A sair…" : "Sair"}
      </button>
      <button
        type="button"
        disabled={aEsquecer}
        onClick={() => iniciarEsquecimento(() => void esquecerEsteAparelho())}
        className="text-xs text-muted underline-offset-4 transition-colors hover:text-red-bright hover:underline disabled:opacity-60"
      >
        {aEsquecer ? "A esquecer…" : "Esquecer este aparelho"}
      </button>
    </div>
  );
}
