import Image from "next/image";
import Link from "next/link";
import { agencia } from "@/data/agencia";
import { stand } from "@/data/stand";

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
                  href="/#contactos"
                  className="text-muted transition-colors hover:text-ink"
                >
                  Contactos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              Contactos
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>
                {stand.morada}, {stand.codigoPostal}
              </li>
              <li>
                <a
                  href={`tel:+351${stand.telemovel.replaceAll(" ", "")}`}
                  className="transition-colors hover:text-ink"
                >
                  {stand.telemovel}
                </a>
                {" · "}
                <a
                  href={`tel:+351${stand.telefone.replaceAll(" ", "")}`}
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
