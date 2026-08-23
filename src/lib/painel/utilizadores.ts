import "server-only";

/*
  Quem pode entrar no painel — uma lista de emails, e mais nada.

      PAINEL_EMAILS=cliente@exemplo.pt,agencia@exemplo.pt

  Não há palavra-passe, não há hash, não há tabela de utilizadores. Quem
  estiver nesta lista pede um código e recebe-o; quem não estiver, não recebe
  nada.

  ## Porque é que a palavra-passe saiu

  Não foi por "password mais código por email não ser dois factores" — o
  argumento habitual assenta no "esqueci a palavra-passe" ir também por email,
  e aqui nunca houve recuperação.

  Foi por outra razão. A palavra-passe da especificação original vinha de uma
  variável de ambiente do seed, sem ecrã para a alterar e sem forma de a
  recuperar. **Uma palavra-passe que o dono não escolheu e não consegue mudar é
  uma palavra-passe que ele esquece e que dá um telefonema.** Tirá-la não
  fragiliza nada que ele controlasse; tira do caminho uma coisa que ele não
  controlava.

  O que fica em troca é dito sem rodeios: **é autenticação de factor único, e a
  caixa de correio é a chave mestra.** Daí a condição que está em
  `docs/admin/07` e que não é técnica — o email de quem entra tem de ter, ele
  próprio, verificação em dois passos.

  ## A allowlist é o que separa isto de um sistema aberto

  Num passwordless público, qualquer pessoa pede um código para qualquer email,
  e o domínio de envio queima reputação a mandar correio para o mundo. Aqui o
  servidor confere a lista **antes** de enviar seja o que for.
*/

export type Utilizador = { email: string; nome: string };

/*
  Lido dentro da função. Nunca no topo do ficheiro: o `next build` do CI corre
  sem uma única variável definida, e ler em module scope rebentava-o.

  Falha **fechado**: sem variável, a lista fica vazia e não entra ninguém — e
  sem atirar, que um ecrã de avaria diria a quem está do outro lado que há aqui
  alguma coisa mal configurada.
*/
function carregar(): Utilizador[] {
  const bruto = process.env.PAINEL_EMAILS;
  if (!bruto) return [];

  return bruto
    .split(",")
    .map(normalizar)
    .filter((e) => e.includes("@") && e.length > 2)
    .map((email) => ({ email, nome: email.split("@")[0] }));
}

/*
  Minúsculas e sem espaços à volta.

  Um email não distingue maiúsculas na prática, e quem o escreve no telemóvel
  apanha uma maiúscula automática na primeira letra quase sempre. Sem esta
  linha, `Cliente@…` não estaria na lista e o painel dizia-lhe, com toda a
  educação, que o código ia a caminho — e não ia.
*/
function normalizar(email: string): string {
  return email.trim().toLowerCase();
}

/** O utilizador, se este email tiver acesso. `null` se não tiver. */
export function autorizado(email: string): Utilizador | null {
  const procurado = normalizar(email);
  return carregar().find((u) => u.email === procurado) ?? null;
}

/*
  `cliente@imperioautoconcept.pt` → `c•••••e@imperioautoconcept.pt`

  O segundo ecrã tem de dizer para onde foi o código, senão quem lá está não
  sabe onde procurar. Mas escrevê-lo por extenso seria confirmar a quem o
  escreveu que aquele endereço tem acesso — que é precisamente o que a resposta
  uniforme do primeiro ecrã existe para não fazer. As pontas chegam para quem é
  dono da caixa reconhecer.
*/
export function meioEscondido(email: string): string {
  const [nome, dominio] = email.split("@");
  if (!dominio) return "•••";

  const visivel =
    nome.length <= 2
      ? nome.slice(0, 1)
      : `${nome[0]}${"•".repeat(Math.min(nome.length - 2, 6))}${nome.at(-1)}`;

  return `${visivel}@${dominio}`;
}
