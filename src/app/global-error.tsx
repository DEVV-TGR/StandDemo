"use client";

import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

/**
 * Rede de segurança para uma falha no próprio layout raiz. Substitui o
 * layout inteiro quando dispara, por isso traz as suas tags <html> e <body>,
 * os estilos globais e a fonte — sem isso, o ecrã de catástrofe apareceria
 * branco e em Times New Roman, que é a pior primeira impressão possível.
 *
 * Deliberadamente sem Header, Footer nem motion: se o layout falhou, quanto
 * menos código correr aqui, melhor.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="pt-PT" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">
          Algo correu mal
        </p>
        <h1 className="mt-4 text-2xl text-ink">
          O site não conseguiu carregar
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Tente novamente dentro de instantes. Se precisar de falar connosco,
          estamos no 933 927 443.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="press gold-metal-fill inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide text-background"
          >
            Tentar de novo
          </button>
          {/* <a> e não <Link>: se o layout raiz falhou, o router pode estar
              em mau estado — aqui quer-se um recarregamento completo. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="press inline-flex items-center justify-center rounded-full border border-gold/40 px-6 py-3 text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright"
          >
            Voltar ao início
          </a>
        </div>
      </body>
    </html>
  );
}
