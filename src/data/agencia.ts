/**
 * Quem desenvolveu o site. Separado de `stand.ts` de propósito: os dados do
 * stand mudam de cliente para cliente, estes não — o crédito viaja com o
 * molde quando serve outro cliente.
 */
export const agencia = {
  nome: "DevPlus",
  url: "https://devplus.pt",
  /*
    Para onde escreve quem tiver um problema com o site. Vai no rodapé de
    todos os emails que saem daqui — incluindo o código de acesso ao painel,
    que é justamente onde alguém pode estar encravado à porta.
  */
  emailSuporte: "support@devplus.pt",
} as const;
