/*
  O que uma acção de pedido devolve ao ecrã.

  Vive num ficheiro só seu porque é a única coisa que o formulário — que corre
  no browser — precisa de saber do servidor. O `enviar.ts` tem `server-only`,
  e um componente de cliente que lhe fosse buscar o tipo arrastava-o consigo.
*/
export type EstadoDoPedido = {
  erro?: string;
  enviado?: boolean;
  /** Segundos até poder enviar outro, quando o limite travou. */
  esperar?: number;
};

export const PEDIDO_INICIAL: EstadoDoPedido = {};
