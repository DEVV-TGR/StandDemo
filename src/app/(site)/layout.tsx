import { ChromeSite } from "@/components/layout/ChromeSite";

/*
  O site público.

  O grupo `(site)` não altera nenhum URL — `(parênteses)` no nome da pasta é
  organização, não caminho. O que dá é uma fronteira: tudo o que está cá dentro
  é montra e recebe o chrome; o painel `/admin` fica de fora e não o recebe.

  É uma ferramenta, não uma montra, e herdar a encenação do site seria tão
  errado como o site herdar a densidade do painel.
*/

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ChromeSite>{children}</ChromeSite>;
}
