"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { apagarViatura } from "@/app/admin/acoes-viaturas";

/*
  Editar e apagar — ícones, não palavras.

  A listagem do PR #12 usava as palavras "Editar" e "Apagar". Passam a lápis e
  caixote, como `docs/admin/05` pede, com três requisitos que os tornam
  utilizáveis: `aria-label` (a etiqueta acessível continua a ser texto),
  `title` para a dica ao passar o rato, e **44×44 px de área de toque**, que é
  o mínimo para um dedo no telemóvel.
*/

function IconeLapis() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m14.5 7.5 2 2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconeCaixote() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AcoesViatura({ id, nome }: { id: string; nome: string }) {
  const [aConfirmar, setAConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const apagar = () =>
    iniciar(async () => {
      const r = await apagarViatura(id);
      if (r.erro) {
        setErro(r.erro);
        setAConfirmar(false);
      }
    });

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/admin/viaturas/${id}`}
          aria-label={`Editar ${nome}`}
          title="Editar"
          className="press flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-gold"
        >
          <IconeLapis />
        </Link>
        <button
          type="button"
          onClick={() => setAConfirmar(true)}
          disabled={pendente}
          aria-label={`Apagar ${nome}`}
          title="Apagar"
          className="press flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-red-bright disabled:opacity-50"
        >
          <IconeCaixote />
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-1 text-right text-xs text-red-bright">
          {erro}
        </p>
      )}

      {/*
        A confirmação **nomeia o que se vai perder**, em vez de perguntar "tem a
        certeza?". Não há desfazer nem lixo de recuperação: quem carrega tem de
        saber exactamente o que desaparece.
      */}
      {aConfirmar && (
        <div
          role="dialog"
          aria-modal
          aria-label="Confirmar remoção"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => setAConfirmar(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/60">
            <p className="font-display text-xl text-ink">Apagar “{nome}”?</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Esta acção remove o anúncio e as respectivas fotos, e não pode ser
              desfeita.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setAConfirmar(false)}
                disabled={pendente}
                className="press flex-1 rounded-full border border-line px-4 py-2.5 text-sm text-muted transition-colors hover:border-gold hover:text-ink disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={apagar}
                disabled={pendente}
                className="press flex-1 rounded-full bg-red px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-red-bright disabled:opacity-60"
              >
                {pendente ? "A apagar…" : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
