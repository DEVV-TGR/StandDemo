import { Destaques } from "@/components/home/Destaques";
import { GrelhaMarcas } from "@/components/home/GrelhaMarcas";
import { Hero } from "@/components/home/Hero";
import { SobreContactos } from "@/components/home/SobreContactos";

export default function Home() {
  return (
    <>
      <Hero />
      <Destaques />
      <GrelhaMarcas />
      <SobreContactos />
    </>
  );
}
