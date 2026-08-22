import { enderecoLinha, stand } from "@/data/stand";

// Morada exata (sem o nome do stand) para o Google geocodificar o ponto certo
// e colocar o pin; nome no negócio pode desviar o resultado.
const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  enderecoLinha,
)}&hl=pt&z=16&output=embed`;

export function MapaStand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line/60 bg-surface ${className}`}
    >
      <iframe
        title={`Mapa — ${stand.nome}`}
        src={mapaEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-full w-full grayscale-[0.3] contrast-[1.05]"
      />
    </div>
  );
}
