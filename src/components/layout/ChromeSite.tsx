import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CtaFlutuante } from "@/components/layout/CtaFlutuante";
import { JsonLd } from "@/components/seo/JsonLd";
import { Preloader } from "@/components/ui/Preloader";
import { TransicaoRota } from "@/components/ui/TransicaoRota";
import { dadosStand } from "@/lib/jsonld";

/*
  Tudo o que envolve uma página do site público: cabeçalho, rodapé, CTA
  flutuante, preloader, transições e o JSON-LD da organização.

  Vive num componente e não directamente no `(site)/layout.tsx` porque tem dois
  utilizadores. O layout do grupo é o óbvio. O outro é o `app/not-found.tsx`,
  que trata os endereços que não correspondem a rota nenhuma: esses são
  apanhados na raiz, **fora** do grupo `(site)`, e por isso não recebem o
  layout dele. Sem isto, escrever `/xpto` devolvia a página de erro pelada do
  Next — verificado, não suposto.
*/

export function ChromeSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Uma vez por página: as rotas filhas referenciam a organização pelo
          @id em vez de repetirem o bloco. */}
      <JsonLd dados={dadosStand()} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CtaFlutuante />
      <TransicaoRota />
      <Preloader />
    </>
  );
}
