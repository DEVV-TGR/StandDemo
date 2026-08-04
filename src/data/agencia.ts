/**
 * Quem desenvolveu o site. Separado de `stand.ts` de propósito: os dados do
 * stand mudam de cliente para cliente, estes não — o crédito viaja com o
 * molde quando serve outro cliente.
 */
export const agencia = {
  nome: "DevPlus",
  url: "https://devplus.pt",
} as const;
