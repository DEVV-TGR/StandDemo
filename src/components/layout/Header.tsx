"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { stand, telHref } from "@/data/stand";

const ligacoes = [
  { href: "/", rotulo: "Início" },
  { href: "/viaturas", rotulo: "Viaturas" },
  { href: "/contactos", rotulo: "Contactos" },
];

export function Header() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  /*
    Com o menu a ocupar o ecrã, o que está por trás não deve deslizar — e o
    Escape tem de o fechar, que é o que qualquer pessoa tenta primeiro.

    Este efeito não chama `setState` de forma síncrona: mexe no DOM e regista
    um ouvinte. É a distinção que a regra do React 19 faz, e a razão de este
    passar onde os outros não passavam.
  */
  useEffect(() => {
    if (!aberto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  /*
    Clicar num link para a página onde já se está.

    Um `<Link>` não tem para onde navegar nesse caso, e o clique fica sem
    resposta nenhuma — quem carrega no logótipo a meio da home espera voltar
    ao topo e não acontece nada. Passa a subir.

    A excepção é o endereço trazer filtros (`/viaturas?marca=…`): aí o clique
    ainda significa alguma coisa — voltar ao catálogo sem filtros — e deixa-se
    navegar como até aqui.

    `scrollTo(0, 0)` sem opções herda o `scroll-behavior` do CSS: suave para
    quem quer movimento, instantâneo para quem pediu `prefers-reduced-motion`
    em `globals.css`. Passar `behavior: "smooth"` aqui atropelava essa escolha.
  */
  const jaAqui = (href: string) =>
    pathname === href && window.location.search === "";

  const aoClicar = (href: string) => (e: React.MouseEvent) => {
    if (!jaAqui(href)) return;
    e.preventDefault();
    window.scrollTo(0, 0);
  };

  /*
    No telemóvel o menu fecha-se e a página sobe — por esta ordem, e não ao
    contrário. Enquanto o menu está aberto o `body` tem `overflow: hidden`, e
    um `scrollTo` contra um body bloqueado não vai a lado nenhum.

    Daí a subida ficar aqui e não no `onClick`: quando este efeito corre, o
    cleanup do efeito acima já devolveu o `overflow` ao que era.
  */
  const subirAoFechar = useRef(false);

  useEffect(() => {
    if (aberto || !subirAoFechar.current) return;
    subirAoFechar.current = false;
    window.scrollTo(0, 0);
  }, [aberto]);

  const aoClicarNoMenu = (href: string) => (e: React.MouseEvent) => {
    if (jaAqui(href)) {
      e.preventDefault();
      subirAoFechar.current = true;
    }
    setAberto(false);
  };

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label={stand.nome}
          onClick={aoClicar("/")}
          className="flex items-center"
        >
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
                onClick={aoClicar(l.href)}
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

    </header>

    {/*
      O menu é um card ao centro, não um painel colado ao cabeçalho.

      Antes empurrava o conteúdo e deixava metade da página a espreitar por
      baixo, o que faz o menu parecer um acidente em vez de uma escolha. Agora
      o fundo escurece e o que se lê é só o que há para escolher — mas o card
      mantém a página presente por trás, que é o que diz a quem o abriu que
      não saiu de lado nenhum.

      **E vive fora do `<header>`**, o que parece detalhe e não é: o cabeçalho
      tem `backdrop-blur`, e um elemento com `backdrop-filter` passa a ser o
      bloco de contenção dos descendentes `fixed`. Lá dentro, o `inset-0`
      media-se contra o cabeçalho — 390×64 em vez do ecrã inteiro.
    */}
    {aberto && (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-6 md:hidden"
        role="dialog"
        aria-modal
        aria-label="Menu"
      >
        {/* Fechar tocando fora — o gesto que toda a gente tenta primeiro. */}
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setAberto(false)}
          className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        />

        <nav className="relative z-10 w-full max-w-xs rounded-2xl border border-line bg-surface px-8 py-10 shadow-2xl shadow-black/60">
          <ul className="flex flex-col items-center gap-6">
            {ligacoes.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={aoClicarNoMenu(l.href)}
                  className="press font-display text-3xl text-ink transition-colors hover:text-gold-bright"
                >
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hairline mx-auto my-7 w-20" />

          <a
            href={telHref(stand.telemovel)}
            onClick={() => setAberto(false)}
            className="press block text-center text-xs uppercase tracking-[0.2em] text-gold"
          >
            Fale connosco
            <span className="mt-2 block text-lg normal-case tracking-normal text-champagne">
              {stand.telemovel}
            </span>
          </a>
        </nav>
      </div>
    )}
    </>
  );
}
