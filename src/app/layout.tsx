import type { Metadata } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CtaFlutuante } from "@/components/layout/CtaFlutuante";
import { JsonLd } from "@/components/seo/JsonLd";
import { Preloader } from "@/components/ui/Preloader";
import { TransicaoRota } from "@/components/ui/TransicaoRota";
import { SUFIXO_TITULO } from "@/lib/seo";
import { dadosStand } from "@/lib/jsonld";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">
        {/* Uma vez, no layout: as outras páginas referenciam a organização
            pelo @id em vez de repetirem o bloco. */}
        <JsonLd dados={dadosStand()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CtaFlutuante />
        <TransicaoRota />
        <Preloader />
      </body>
    </html>
  );
}
