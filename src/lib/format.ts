const euros = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numero = new Intl.NumberFormat("pt-PT");

export const MESES_ABREV = [
  "Jan.",
  "Fev.",
  "Mar.",
  "Abr.",
  "Mai.",
  "Jun.",
  "Jul.",
  "Ago.",
  "Set.",
  "Out.",
  "Nov.",
  "Dez.",
] as const;

export function formatarPreco(valor: number): string {
  return euros.format(valor);
}

export function formatarNumero(valor: number): string {
  return numero.format(valor);
}

export function formatarKm(valor: number): string {
  return `${numero.format(valor)} km`;
}

export function formatarRegisto(mes: number, ano: number): string {
  return `${MESES_ABREV[mes - 1]} ${ano}`;
}

/*
  O dia civil em Lisboa, como [ano, mês, dia].

  Não se usa `getDate()` e companhia: no servidor da Vercel o relógio anda em
  UTC, e uma viatura publicada às 00h30 de Lisboa em Agosto contava como sendo
  do dia anterior — a lista dizia "ontem" a quem tinha acabado de publicar.
*/
const partesLisboa = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function diaCivil(d: Date): [number, number, number] {
  const [ano, mes, dia] = partesLisboa.format(d).split("-").map(Number);
  return [ano, mes, dia];
}

/** `24 Ago. 2026` — a data por extenso, no mesmo dialecto de `formatarRegisto`. */
export function formatarData(d: Date): string {
  const [ano, mes, dia] = diaCivil(d);
  return `${dia} ${MESES_ABREV[mes - 1]} ${ano}`;
}

/*
  `hoje`, `ontem`, `há 3 dias` — e a partir de um mês, a data por extenso.

  Numa lista de anúncios a pergunta é "há quanto tempo está isto no site", e a
  essa pergunta um número de dias responde de relance enquanto uma data obriga
  a fazer contas. Passado um mês inverte-se: "há 47 dias" já não diz nada a
  ninguém e a data volta a ser mais útil.

  Quem quiser o dia exacto tem-no no `title` de quem chama isto.
*/
export function formatarDataRelativa(d: Date, agora = new Date()): string {
  const dias = Math.round(
    (Date.UTC(...diaCivil(agora)) - Date.UTC(...diaCivil(d))) / 86_400_000,
  );

  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return formatarData(d);
}

export function formatarPotencia(cv: number): string {
  return `${cv} cv`;
}

export function formatarCilindrada(cc: number): string {
  return `${numero.format(cc)} cc`;
}
