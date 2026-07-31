"use client";

import Link from "next/link";
import { useTransition } from "react";
import { apagarViatura } from "@/app/admin/actions";

export function AcoesViatura({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const [pendente, startTransition] = useTransition();

  const apagar = () => {
    if (
      !confirm(
        `Apagar "${nome}"? Esta ação remove o anúncio e as respetivas fotos e não pode ser desfeita.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await apagarViatura(id);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/viaturas/${id}`}
        className="px-3 py-1.5 text-xs tracking-wide text-muted transition-colors hover:text-gold"
      >
        Editar
      </Link>
      <button
        type="button"
        onClick={apagar}
        disabled={pendente}
        className="px-3 py-1.5 text-xs tracking-wide text-muted transition-colors hover:text-red-400 disabled:opacity-50"
      >
        {pendente ? "A apagar…" : "Apagar"}
      </button>
    </div>
  );
}
