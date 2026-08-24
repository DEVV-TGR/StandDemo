"use client";

import Link from "next/link";

/*
  Quando a leitura do painel falha.

  Existe por causa de uma decisão do `src/lib/painel/viaturas.ts`: ao contrário
  do site, o painel **não** recua para o inventário estático quando a base não
  responde. Se o fizesse, o cliente apagava uma viatura, via-a reaparecer, e
  concluía que o painel está avariado.

  O preço dessa decisão é que a falha aparece — e este ficheiro é o que faz com
  que apareça em português, com o que fazer a seguir, em vez do ecrã de avaria
  da Vercel com um número de oito algarismos.
*/

export default function ErroDoPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Gestão</p>
      <h1 className="mt-3 font-display text-3xl text-ink">
        Não foi possível carregar as viaturas
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        O painel não está a conseguir falar com a base de dados. Não é nada do
        que fez — e o site continua a servir o inventário publicado aos
        visitantes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="gold-metal-fill press rounded-full px-5 py-2.5 text-sm font-medium text-background"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="press rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-gold hover:text-ink"
        >
          Ver site
        </Link>
      </div>
      {/* O `digest` é o que permite encontrar este erro nos registos da Vercel.
          Sem ele, "deu erro" é tudo o que se consegue dizer ao suporte. */}
      {error.digest && (
        <p className="mt-8 font-mono text-xs text-muted">
          Referência: {error.digest}
        </p>
      )}
    </main>
  );
}
