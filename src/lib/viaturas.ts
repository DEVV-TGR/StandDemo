import "server-only";
import { cache } from "react";
import { viaturas as inventarioEstatico } from "@/data/viaturas";
import type { Viatura } from "@/lib/types";

/*
  A porta única para o inventário.

  Todo o site lê as viaturas por aqui — nenhuma página e nenhum componente
  importa `@/data/viaturas` directamente. Há uma regra de ESLint a garanti-lo
  (`no-restricted-imports` em `eslint.config.mjs`), porque uma convenção que
  só existe na cabeça de quem a escreveu dura até ao PR seguinte.

  ## Porquê agora, se ainda não há base de dados

  Porque é a fronteira que permite a base entrar depois **sem tocar em mais
  nada**. Neste momento estas funções devolvem o ficheiro estático; quando o
  Neon existir, muda o corpo delas e o resto do site nem dá por isso.

  Foi a ausência desta fronteira que tornou o PR #12 num diff de 46 ficheiros,
  onde a decisão que partiu o site ficou enterrada.

  ## Porquê assíncronas, se hoje não esperam por nada

  Para o contrato não mudar quando passarem a esperar. Uma função que hoje é
  síncrona e amanhã devolve uma promessa obriga a mexer em todos os
  chamadores — que é exactamente o trabalho que esta camada existe para
  evitar. O `async` de hoje é o preço de não repetir a conversão amanhã.

  ## `server-only`

  Se alguém importar este módulo a partir de um componente com `"use client"`,
  o build falha. Hoje isso protege pouco — o inventário estático é público de
  qualquer maneira. Quando aqui dentro estiver uma ligação ao Neon, protege as
  credenciais, e nessa altura não há ninguém para se lembrar de o acrescentar.
*/

/*
  Memoizado com o `cache` do React: dentro do mesmo render, a página e o
  `ChromeSite` pedem ambos o inventário e a leitura acontece uma vez só. Hoje
  poupa pouco — é um `import` de um ficheiro; quando for uma consulta ao Neon,
  poupa metade delas. Não é cache entre pedidos.
*/

/** Todas as viaturas, mais recentes primeiro. */
export const getViaturas = cache(async (): Promise<Viatura[]> => {
  return inventarioEstatico;
});

/** Uma viatura pelo id, ou `null` se não existir. */
export async function getViatura(id: string): Promise<Viatura | null> {
  return inventarioEstatico.find((v) => v.id === id) ?? null;
}

/** As que aparecem em "Viaturas em Destaque", na homepage. */
export async function getDestaques(): Promise<Viatura[]> {
  return inventarioEstatico.filter((v) => v.destaque);
}

/**
 * Até `limite` outras viaturas, para a secção "Também vai gostar destas".
 *
 * Exclui a que está a ser vista — sugerir a alguém a página onde já está é o
 * tipo de detalhe que ninguém elogia e toda a gente nota.
 */
export async function getSugestoes(
  idExcluir: string,
  limite = 3,
): Promise<Viatura[]> {
  return inventarioEstatico.filter((v) => v.id !== idExcluir).slice(0, limite);
}
