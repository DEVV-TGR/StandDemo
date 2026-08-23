import "server-only";
import { hkdfSync, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { configuracao } from "@/db/schema";

/*
  Uma chave por uso, derivadas de um segredo que nasce sozinho.

  | uso | o quê |
  |---|---|
  | `sessao` | assinar o cookie de quem já entrou |
  | `desafio` | assinar o cookie que aponta ao código pendente |
  | `aparelho` | assinar o "este aparelho já passou pelo email" |

  **As três não podem ser a mesma chave.** Sem separação, um selo de sessão
  podia ser apresentado como selo de aparelho, e uma fraqueza num dos usos
  passava aos outros. O `hkdf` é a ferramenta desenhada exactamente para isto —
  esticar um segredo em várias chaves independentes, com um rótulo por uso.

  Sem sal: a separação que interessa é entre os três usos, e essa é feita pelo
  rótulo, que é o parâmetro `info` e é para isso que ele existe. Um sal fixo
  escrito no código não acrescentava nada, e um variável obrigava a guardá-lo em
  algum lado.
*/

const CHAVE_DO_SEGREDO = "painel:segredo";

/*
  Memoizado por instância.

  Sem isto, cada pedido ao painel ia à base buscar o mesmo valor que nunca
  muda. O custo de memoizar é o dia em que o segredo for apagado: as instâncias
  já em pé continuam a assinar com o antigo até serem recicladas. Para um botão
  de emergência que se carrega uma vez na vida, e num sítio onde as instâncias
  duram minutos, é troca boa.
*/
let emCache: string | null = null;

async function segredo(): Promise<string> {
  if (emCache) return emCache;

  const [existente] = await db
    .select({ valor: configuracao.valor })
    .from(configuracao)
    .where(eq(configuracao.chave, CHAVE_DO_SEGREDO))
    .limit(1);

  if (existente) {
    emCache = existente.valor;
    return emCache;
  }

  const novo = randomBytes(32).toString("base64");

  /*
    Atómico: se duas instâncias arrancarem ao mesmo tempo, uma insere e a outra
    não faz nada. Quem perdeu a corrida lê a seguir o que a outra pôs — o que
    interessa é as duas acabarem com o mesmo segredo, não qual delas ganhou.
  */
  await db
    .insert(configuracao)
    .values({ chave: CHAVE_DO_SEGREDO, valor: novo })
    .onConflictDoNothing({ target: configuracao.chave });

  const [final] = await db
    .select({ valor: configuracao.valor })
    .from(configuracao)
    .where(eq(configuracao.chave, CHAVE_DO_SEGREDO))
    .limit(1);

  emCache = final?.valor ?? novo;
  return emCache;
}

export type Uso = "sessao" | "desafio" | "aparelho";

export async function chave(uso: Uso, bytes = 32): Promise<Buffer> {
  return Buffer.from(
    hkdfSync("sha256", await segredo(), "", `imperio:${uso}:v1`, bytes),
  );
}

/** Só para os testes: esquece o segredo memoizado desta instância. */
export function esquecerSegredo(): void {
  emCache = null;
}
