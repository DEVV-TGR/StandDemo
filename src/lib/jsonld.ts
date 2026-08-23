import { stand } from "@/data/stand";
import { urlViatura } from "@/lib/slug";
import { SITE_NAME, SITE_URL, urlAbsoluto } from "@/lib/site";
import type { Viatura } from "@/lib/types";

/**
 * Dados estruturados do site. Nota de expectativa: o rich result dedicado a
 * listagens de veículos foi descontinuado pelo Google em 2025 — isto não põe
 * cartões de viatura na SERP. Vale por outra razão: é como o Google liga o
 * site à entidade "Império Auto Concept" (útil para o painel de conhecimento
 * e para a associação ao Perfil de Empresa), e é o que motores de resposta e
 * assistentes leem.
 *
 * Regra que se aplica a tudo o que está aqui: só se marca o que está visível
 * na página. Nenhum destes campos é inventado — todos aparecem no site.
 */

/** Referência à organização, para as ofertas não repetirem o bloco todo. */
export const ID_ORGANIZACAO = `${SITE_URL}/#organization`;

export function dadosStand(lista: Viatura[]) {
  const precos = lista
    .filter((v) => v.estadoVenda !== "vendido")
    .map((v) => v.preco);

  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": ID_ORGANIZACAO,
    name: SITE_NAME,
    url: SITE_URL,
    logo: urlAbsoluto("/logo/imperio-mark-md.png"),
    image: urlAbsoluto("/opengraph-image"),
    description:
      "Stand de automóveis premium no Porto. Viaturas usadas e seminovas com garantia e histórico documentado.",
    telephone: [stand.telemovel, stand.telefone].map(
      (n) => `+351${n.replaceAll(" ", "")}`,
    ),
    email: stand.email,
    currenciesAccepted: "EUR",
    priceRange: `${Math.min(...precos)}–${Math.max(...precos)} EUR`,
    address: {
      "@type": "PostalAddress",
      streetAddress: stand.morada,
      // ⚠️ Incompleto — ver a nota em src/data/stand.ts. Fica o que está
      // visível no site; um código postal inventado seria pior.
      postalCode: stand.codigoPostal,
      addressLocality: stand.localidade,
      addressRegion: stand.distrito,
      addressCountry: stand.pais,
    },
    // Sem `geo`: as coordenadas exatas do stand ainda não foram confirmadas e
    // um ponto errado no mapa é pior do que ponto nenhum.
    openingHoursSpecification: stand.horarios.flatMap((dia) =>
      dia.periodos.map(([abre, fecha]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dia.diasSchema,
        opens: abre,
        closes: fecha,
      })),
    ),
    areaServed: { "@type": "AdministrativeArea", name: stand.distrito },
    // O Facebook fica de fora enquanto for um shortlink /share/ — o `sameAs`
    // é o que liga o site às redes, e um link instável não serve.
    sameAs: [stand.instagram],
  };
}

export function dadosViatura(v: Viatura) {
  const url = urlAbsoluto(urlViatura(v));
  const vendido = v.estadoVenda === "vendido";

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#viatura`,
    url,
    name: `${v.marca} ${v.modelo} ${v.versao}`,
    description: v.descricao,
    sku: v.id,
    // VIN e matrícula estão publicados na ficha técnica da página. Se o
    // cliente decidir retirá-los da página, retirar também esta linha.
    vehicleIdentificationNumber: v.vin,
    brand: { "@type": "Brand", name: v.marca },
    model: v.modelo,
    vehicleConfiguration: v.versao,
    vehicleModelDate: String(v.registoAno),
    dateVehicleFirstRegistered: `${v.registoAno}-${String(v.registoMes).padStart(2, "0")}`,
    itemCondition: "https://schema.org/UsedCondition",
    color: v.cor,
    vehicleInteriorColor: v.corInterior,
    bodyType: v.segmento,
    numberOfDoors: v.portas,
    seatingCapacity: v.lugares,
    vehicleTransmission: v.transmissao,
    fuelType: v.combustivel,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: v.quilometros,
      unitCode: "KMT",
    },
    vehicleEngine: {
      "@type": "EngineSpecification",
      engineDisplacement: {
        "@type": "QuantitativeValue",
        value: v.cilindradaCc,
        unitCode: "CMQ",
      },
      // `unitText` em vez de código UN/CEFACT: não há um código fiável para
      // cavalo-vapor e um código adivinhado é pior do que texto claro.
      enginePower: {
        "@type": "QuantitativeValue",
        value: v.potenciaCv,
        unitText: "cv",
      },
    },
    image: v.fotos.map((f) => urlAbsoluto(f)),
    offers: {
      "@type": "Offer",
      url,
      price: v.preco,
      priceCurrency: "EUR",
      availability: vendido
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": ID_ORGANIZACAO },
    },
  };
}

/** Espelha o percurso visível no topo da página: Viaturas / Marca / Modelo. */
export function dadosPercurso(v: Viatura) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Viaturas",
        item: urlAbsoluto("/viaturas"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: v.marca,
        item: urlAbsoluto(`/viaturas?marca=${v.marcaSlug}`),
      },
      // O último item não leva `item`: é a página atual.
      { "@type": "ListItem", position: 3, name: v.modelo },
    ],
  };
}
