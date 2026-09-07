"use server";

import { enviarPedido } from "@/lib/pedidos/enviar";
import type { EstadoDoPedido } from "@/lib/pedidos/estado";

/*
  As duas acções dos formulários do site.

  São finas de propósito: o que fazem está em `@/lib/pedidos/enviar`, igual
  para as duas, e aqui fica só a fronteira — o que o `useActionState` chama.
  Ao contrário das acções do painel, não há sessão a exigir: isto é público,
  e é o `enviar.ts` que trata de quem abusa.

  Não há `revalidatePath`: um pedido não muda nada no site.
*/

export async function enviarPedidoDeCompra(
  _estado: EstadoDoPedido,
  dados: FormData,
): Promise<EstadoDoPedido> {
  return enviarPedido("compra", dados);
}

export async function enviarPedidoDeImportacao(
  _estado: EstadoDoPedido,
  dados: FormData,
): Promise<EstadoDoPedido> {
  return enviarPedido("importacao", dados);
}
