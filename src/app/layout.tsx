import type { Metadata } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import { SUFIXO_TITULO } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

/*
  O layout de raiz, e só o que tem mesmo de ser de raiz.

  O `<html>`, as fontes, o CSS global e a metadata base — porque o Next exige
  que existam aqui, e porque valem para tudo o que a aplicação sirva.

  **O chrome do site não vive aqui.** Header, Footer, CTA flutuante, preloader
  e transições de rota mudaram-se para `(site)/layout.tsx`, onde só os apanha
  quem pertence ao site público. O painel `/admin` é outro produto na mesma
  aplicação: é uma ferramenta, não uma montra, e herdar a encenação do site
  seria tão errado como o site herdar a densidade do painel.
*/

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Stand de carros usados no Porto`,
    template: `%s${SUFIXO_TITULO}`,
  },
  description:
    "Stand de automóveis premium no Porto. Viaturas usadas e seminovas selecionadas a dedo, com garantia e histórico documentado. Rua do Freixo 1680.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "pt_PT",
    type: "website",
  },
  // `summary_large_image` em todas as páginas: as fotos das viaturas são o
  // conteúdo, e um cartão pequeno desperdiça-as. Antes divergia por página.
  twitter: { card: "summary_large_image" },
  // O canonical é declarado rota a rota, nunca aqui: um canonical herdado do
  // layout apontaria todas as páginas filhas para "/".
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
