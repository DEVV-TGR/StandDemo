import Image from "next/image";
import Link from "next/link";
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
              <li>
                <a
                  href={stand.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  Instagram ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-12" />
        <p className="mt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {stand.nome} — site de demonstração.
        </p>
      </div>
    </footer>
  );
}
