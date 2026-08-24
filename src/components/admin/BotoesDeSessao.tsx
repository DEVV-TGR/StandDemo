"use client";

import { useTransition } from "react";
import { sair, esquecerEsteAparelho } from "@/app/admin/acoes-entrada";

/*
  Duas acções com pesos muito diferentes, e por isso em sítios diferentes.

  **Sair** é o dia a dia: fecha a sessão e deixa o aparelho lembrado, para a
  próxima entrada não pedir código. Fica no cabeçalho, ao lado do botão de
  adicionar — estavam empilhados em coluna, o que fazia o conjunto ter altura
  diferente do vizinho e desalinhava os dois.

  **Esquecer este aparelho** é raro e quase irreversível: obriga a ir buscar
  outro código ao email. Vai para o fundo da página, que é onde vivem as
  acções que se procuram de propósito e não se encontram por acidente.
*/

/** A altura partilhada com o botão de adicionar, para os dois assentarem. */
const ALTURA = "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm";

export function BotaoSair() {
  const [aSair, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={aSair}
      onClick={() => iniciar(() => void sair())}
      className={`${ALTURA} press border border-line text-muted transition-colors hover:border-gold hover:text-gold-bright disabled:opacity-60`}
    >
      {aSair ? "A sair…" : "Sair"}
    </button>
  );
}

export function EsquecerAparelho() {
  const [aEsquecer, iniciar] = useTransition();

  return (
    <div className="mt-12 border-t border-line/40 pt-6">
      <button
        type="button"
        disabled={aEsquecer}
        onClick={() => iniciar(() => void esquecerEsteAparelho())}
        className="text-xs text-muted underline-offset-4 transition-colors hover:text-red-bright hover:underline disabled:opacity-60"
      >
        {aEsquecer ? "A esquecer…" : "Esquecer este aparelho"}
      </button>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted/70">
        Este browser deixa de ser reconhecido e a próxima entrada volta a pedir
        um código por email. É o que se carrega depois de usar um computador que
        não é seu.
      </p>
    </div>
  );
}
