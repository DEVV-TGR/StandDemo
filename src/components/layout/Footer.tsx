import Image from "next/image";
import Link from "next/link";
import { agencia } from "@/data/agencia";
import { enderecoLinha, stand, telHref } from "@/data/stand";

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Image
              src="/logo/imperio-mark-sm.png"
              alt={stand.nome}
              width={440}
              height={232}
              className="h-14 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {stand.slogan}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              Navegação
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted transition-colors hover:text-ink">
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/viaturas"
                  className="text-muted transition-colors hover:text-ink"
                >
                  Viaturas
                </Link>
              </li>
              <li>
                <Link
                  href="/contactos"
                  className="text-muted transition-colors hover:text-ink"
                >
                  Contactos
                </Link>
              </li>
              <li>
                {/* Obrigação legal: Decreto-Lei n.º 156/2005, alterado pelo
                    Decreto-Lei n.º 74/2017 — quem tem presença na Internet
                    divulga o acesso à plataforma em local visível.
                    TODO: substituir o texto pelo logótipo oficial, obtido em
                    livroreclamacoes.pt (não recriar), e confirmar com o
                    cliente que a empresa está registada na plataforma — o
                    link sem registo prévio não cumpre a obrigação. */}
                <a
                  href="https://www.livroreclamacoes.pt/inicio"
                  target="_blank"
                  rel="noopener"
                  className="text-muted transition-colors hover:text-ink"
                >
                  Livro de Reclamações ↗
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              Contactos
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>
                {enderecoLinha}
              </li>
              <li>
                <a
                  href={telHref(stand.telemovel)}
                  className="transition-colors hover:text-ink"
                >
                  {stand.telemovel}
                </a>
                {" · "}
                <a
                  href={telHref(stand.telefone)}
                  className="transition-colors hover:text-ink"
                >
                  {stand.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${stand.email}`}
                  className="transition-colors hover:text-ink"
                >
                  {stand.email}
                </a>
              </li>
              <li className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                <a
                  href={stand.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  WhatsApp ↗
                </a>
                <span className="text-gold-deep">·</span>
                <a
                  href={stand.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  Instagram ↗
                </a>
                <span className="text-gold-deep">·</span>
                <a
                  href={stand.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  Facebook ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* A Política de Privacidade entra aqui assim que o texto estiver
            validado — a página existe em /privacidade, ainda como rascunho e
            com noindex. Ver o cabeçalho de src/app/privacidade/page.tsx. */}
        <div className="hairline mt-12" />
        <div className="mt-6 flex flex-col items-center justify-center gap-1 text-xs text-muted sm:flex-row sm:gap-2.5">
          <p>
            © {new Date().getFullYear()} {stand.nome}
          </p>
          <span aria-hidden className="hidden text-gold-deep sm:inline">
            ·
          </span>
          <p>
            Desenvolvido por{" "}
            <a
              href={agencia.url}
              target="_blank"
              rel="noreferrer"
              className="text-champagne transition-colors hover:text-gold-bright"
            >
              {agencia.nome} ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
