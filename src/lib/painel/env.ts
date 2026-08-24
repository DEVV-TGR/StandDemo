/*
  Ler uma variável de ambiente sem as aspas que lá foram parar por engano.

  A mesma variável é escrita em dois sítios com regras diferentes: num ficheiro
  `.env`, onde o valor leva aspas, e no campo da consola da Vercel, onde não
  leva. Colar de um para o outro traz as aspas atrás.

  Aconteceu em uso real, com o `PAINEL_EMAILS`. O efeito foi cruel: a aspa de
  abertura colou-se ao primeiro email e a de fecho ao último, **nenhum voltou a
  bater**, e o ecrã respondeu exactamente o mesmo que responde a um endereço
  sem acesso — de propósito, para não revelar quem entra. O sintoma foi "não
  chega código nenhum", e a procura começou no Resend e no spam.

  ## Só as das pontas, e só se emparelhadas

  Tirar **todas** as aspas seria imprudente: uma palavra-passe pode conter uma,
  e o `DATABASE_URL` levá-la no meio. O que se tira é o par que envolve o valor
  inteiro, que é a forma exacta do engano — e é o que um `.env` significa com
  elas.
*/
export function semAspas(valor: string | undefined): string | undefined {
  if (!valor) return valor;

  const t = valor.trim();
  const primeiro = t[0];
  const ultimo = t[t.length - 1];

  const emparelhadas =
    t.length >= 2 && (primeiro === '"' || primeiro === "'") && ultimo === primeiro;

  return emparelhadas ? t.slice(1, -1) : t;
}
