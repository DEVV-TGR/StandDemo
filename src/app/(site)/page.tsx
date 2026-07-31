import { Destaques } from "@/components/home/Destaques";
import { GrelhaMarcas } from "@/components/home/GrelhaMarcas";
import { Hero } from "@/components/home/Hero";
import { SobreContactos } from "@/components/home/SobreContactos";
import { getViaturas } from "@/lib/viaturas";

// Lê o stock da base de dados a cada pedido, para refletir de imediato as
// alterações feitas no /admin.
export const dynamic = "force-dynamic";

export default async function Home() {
  const viaturas = await getViaturas();

  return (
    <>
      <Hero viaturas={viaturas} />
      <Destaques viaturas={viaturas} />
      <GrelhaMarcas viaturas={viaturas} />
      <SobreContactos />
    </>
  );
}
