import type { Metadata } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CtaFlutuante } from "@/components/layout/CtaFlutuante";
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
  metadataBase: new URL("https://imperioautoconcept.pt"),
  title: {
    default: "Imperio Auto Concept — Viaturas Premium",
    template: "%s | Imperio Auto Concept",
  },
  description:
    "Stand de automóveis premium. Viaturas usadas e seminovas selecionadas a dedo, com garantia e histórico documentado. Pesquise por marca, modelo, preço e muito mais.",
  openGraph: {
    siteName: "Imperio Auto Concept",
    locale: "pt_PT",
    type: "website",
  },
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CtaFlutuante />
      </body>
    </html>
  );
}
