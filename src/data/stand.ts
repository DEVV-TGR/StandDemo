export const stand = {
  nome: "Império Auto Concept",
  slogan: "Viaturas premium, escolhidas a dedo.",
  morada: "Rua do Freixo 1680",
  codigoPostal: "4300-214",
  localidade: "Porto",
  distrito: "Porto",
  pais: "PT",
  telefone: "936 498 610",
  telefoneNota: "Chamada para a rede móvel nacional",
  telemovel: "933 927 443",
  telemovelNota: "Chamada para a rede móvel nacional",
  email: "imperioautoconcept@gmail.com",
  instagram: "https://www.instagram.com/imperioautoconcept/",
  /**
   * ⚠️ Shortlink de partilha, não o URL canónico da página. Links /share/
   * são instáveis e não servem como `sameAs` no JSON-LD, onde o Google os usa
   * para ligar o site à entidade. Pedir ao cliente o endereço definitivo.
   */
  facebook: "https://www.facebook.com/share/1HGa2Uc1eW/?mibextid=wwXIfr",
  // WhatsApp: abre direto a conversa (+351 933 927 443)
  whatsapp: "https://wa.me/351933927443",
  mapsUrl: "https://maps.google.com/?q=Rua+do+Freixo+1680+Porto",
  /**
   * Horário em forma estruturada, com os dias em inglês que o schema.org
   * exige. O texto visível é derivado daqui por `horasTexto()` — antes eram
   * duas listas e havia o risco de o site dizer uma coisa e o JSON-LD outra.
   */
  horarios: [
    {
      dias: "Segunda a Sexta",
      diasSchema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      periodos: [
        ["09:30", "13:00"],
        ["14:30", "19:00"],
      ],
    },
    {
      dias: "Sábado",
      diasSchema: ["Saturday"],
      periodos: [["09:30", "13:00"]],
    },
    { dias: "Domingo", diasSchema: ["Sunday"], periodos: [] },
  ],
  sobre: [
    "Na Império Auto Concept, cada viatura é selecionada a dedo. Trabalhamos apenas com automóveis premium, verificados ponto a ponto, com histórico documentado e garantia incluída.",
    "A compra de um carro é uma decisão importante — por isso acompanhamos cada cliente do primeiro contacto à entrega, com transparência total e soluções de financiamento à medida.",
  ],
} as const;

/**
 * A morada numa linha, tal como aparece no rodapé, na secção de contactos e
 * na imagem de partilha. Existe para que as três não possam divergir: um NAP
 * inconsistente entre o site e o Perfil de Empresa custa posições no Maps.
 */
export const enderecoLinha = `${stand.morada}, ${stand.codigoPostal} ${stand.localidade}`;

/** Número em E.164, o formato que o `tel:` e o JSON-LD esperam. */
export function telE164(numero: string): string {
  return `+351${numero.replaceAll(" ", "")}`;
}

/** `href` de chamada. Estava escrito à mão em cinco componentes. */
export function telHref(numero: string): string {
  return `tel:${telE164(numero)}`;
}

/** Horário de um dia em texto: "09:30 – 13:00 · 14:30 – 19:00" ou "Encerrado". */
export function horasTexto(dia: (typeof stand.horarios)[number]): string {
  if (dia.periodos.length === 0) return "Encerrado";
  return dia.periodos.map(([abre, fecha]) => `${abre} – ${fecha}`).join(" · ");
}
