import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CtaFlutuante } from "@/components/layout/CtaFlutuante";
import { Preloader } from "@/components/ui/Preloader";
import { TransicaoRota } from "@/components/ui/TransicaoRota";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CtaFlutuante />
      <TransicaoRota />
      <Preloader />
    </>
  );
}
