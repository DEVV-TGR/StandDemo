"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { stand, telHref } from "@/data/stand";

const ligacoes = [
  { href: "/", rotulo: "Início" },
  { href: "/viaturas", rotulo: "Viaturas" },
  { href: "/#contactos", rotulo: "Contactos" },
];

export function Header() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={stand.nome} className="flex items-center">
          <Image
            src="/logo/imperio-mark-sm.png"
            alt={stand.nome}
            width={440}
            height={232}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {ligacoes.map((l) => {
            const ativo =
              l.href === "/" ? pathname === "/" : pathname.startsWith("/viaturas") && l.href === "/viaturas";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm tracking-wide transition-colors ${
                  ativo ? "text-gold" : "text-muted hover:text-ink"
                }`}
              >
                {l.rotulo}
              </Link>
            );
          })}
          <a
            href={telHref(stand.telemovel)}
            className="press rounded-full border border-gold/40 px-5 py-2 text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright"
          >
            Fale connosco
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="press flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-ink transition-transform ${aberto ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-ink transition-transform ${aberto ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {aberto && (
        <nav
          className="border-t border-line/60 bg-background/95 px-6 py-6 md:hidden"
          aria-label="Menu móvel"
        >
          <ul className="flex flex-col gap-5">
            {ligacoes.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-display text-2xl text-ink transition-colors hover:text-gold"
                >
                  {l.rotulo}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={telHref(stand.telemovel)}
                className="text-sm tracking-wide text-gold"
              >
                Fale connosco — {stand.telemovel}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
