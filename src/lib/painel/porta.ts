import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { abrir, NOME_DO_COOKIE } from "./sessao";

/*
  A porta do painel — e é esta a fechadura.

  ## Porque é que isto não está no layout

  Porque **um layout não é fronteira de segurança**, e os documentos do Next
  dizem-no com todas as letras: não volta a renderizar em navegação do lado do
  cliente e não impede um segmento filho de correr. Um `exigirSessao()` no
  layout dava a sensação de proteger tudo o que está por baixo e não protegia
  nada.

  A especificação original (`docs/admin/03`) chamava ao gate no layout a
  primeira das "duas camadas obrigatórias". É o ponto em que ela está errada, e
  este ficheiro é a correcção: a verificação faz-se o mais perto possível dos
  dados — em cada `page.tsx` e à cabeça de cada acção que grava.

  O layout do painel chama a `sessao()` para mostrar quem está ligado, e mais
  nada.

  ## O `cache` do React

  Memoiza dentro do mesmo render: a página e o cabeçalho pedem a sessão e o
  cookie só é aberto uma vez. Não é cache entre pedidos.
*/

export const sessao = cache(async () => {
  const valor = (await cookies()).get(NOME_DO_COOKIE)?.value;
  return abrir(valor);
});

/** Para páginas. Quem não tem sessão vai para o ecrã de entrada. */
export const exigirSessao = cache(async () => {
  const s = await sessao();
  if (!s) redirect("/admin/entrar");
  return s;
});

/*
  Para server actions.

  Não redirecciona: atira. Uma action é um ponto de entrada como outro
  qualquer — **pode ser chamada por um POST feito à mão, sem browser e sem
  página** — e a resposta certa a "não tens sessão" é recusar, não mandar
  navegar para lado nenhum.
*/
export async function exigirSessaoNaAccao() {
  const s = await sessao();
  if (!s) throw new Error("Sem sessão.");
  return s;
}
