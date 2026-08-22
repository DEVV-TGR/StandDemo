import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { enderecoLinha } from "@/data/stand";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — stand de carros usados premium no Porto`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem de partilha da homepage (e de qualquer rota que não defina a sua).
 * Antes não existia nenhuma: partilhar o site no WhatsApp — o canal principal
 * de contacto deste stand — mostrava um cartão sem imagem.
 *
 * Sem fonte externa de propósito: o Bodoni só existe via next/font e um fetch
 * a servidores de fontes no build é um ponto de falha desnecessário. A marca
 * aqui é o wordmark, e o resto segue a assinatura do site (maiúsculas com
 * tracking largo). Os dourados são os tokens OKLCH de globals.css convertidos
 * para sRGB — satori não interpreta oklch().
 */
export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/logo/imperio-mark-md.png"),
    "base64",
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#070707",
          // véu quente no canto superior direito, como o grão do hero
          backgroundImage:
            "radial-gradient(1000px 500px at 88% -10%, rgba(192,150,90,0.22), rgba(7,7,7,0) 70%)",
          border: "1px solid #2a261e",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <img
            src={`data:image/png;base64,${logo}`}
            alt=""
            width={342}
            height={180}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 7,
              textTransform: "uppercase",
              color: "#c0965a",
            }}
          >
            Stand de automóveis premium · Porto
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 62,
              fontWeight: 600,
              color: "#f4f2e9",
              lineHeight: 1.1,
            }}
          >
            Viaturas usadas e seminovas, escolhidas a dedo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              background: "#2a261e",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 26,
              fontSize: 25,
              color: "#a29f8f",
            }}
          >
            <div style={{ display: "flex" }}>
              {enderecoLinha}
            </div>
            <div style={{ display: "flex", color: "#e3d6bd" }}>
              imperioautoconcept.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
