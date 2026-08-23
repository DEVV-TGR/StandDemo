import type { Metadata } from "next";

/*
  O painel não é o site.

  Herda o `<html>`, as fontes e os tokens de cor do layout de raiz, e mais
  nada — o cabeçalho, o rodapé, o CTA flutuante, o preloader e as transições
  de rota ficam no grupo `(site)`. É a razão de esse grupo existir.

  `docs/admin/05` diz porquê: o painel é ferramenta, o site é montra. Uma
  interface de gestão que se anima a cada scroll é irritante ao fim de dez
  minutos.
*/

export const metadata: Metadata = {
  title: "Gestão",
  // Nada daqui tem que estar no Google. O `robots.ts` também o exclui, mas
  // essas duas defesas custam uma linha cada e falham por motivos diferentes.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background text-ink">{children}</div>;
}
