import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessao } from "@/lib/painel/porta";
import { meioEscondido } from "@/lib/painel/utilizadores";
import { emailDoDesafio, NOME_DO_DESAFIO } from "@/lib/painel/codigo";
import { FormularioDeCodigo } from "@/components/admin/FormularioDeCodigo";

/*
  O segundo ecrã: o código.

  Só se chega aqui com um desafio a meio — ou seja, com um email da lista e um
  código já enviado. Quem lá bater sem isso é mandado para o princípio, e não
  fica a saber que este ecrã existe para alguma coisa.

  O endereço aparece meio escondido (`c•••••e@…`). Escrevê-lo por extenso seria
  confirmar a quem o escreveu que aquele endereço tem acesso — precisamente o
  que a resposta uniforme do primeiro ecrã existe para não fazer. As pontas
  chegam para quem é dono da caixa reconhecer.
*/

export const metadata = { title: "Código" };

export default async function Codigo() {
  if (await sessao()) redirect("/admin");

  const frasco = await cookies();
  const email = await emailDoDesafio(frasco.get(NOME_DO_DESAFIO)?.value);
  if (!email) redirect("/admin/entrar");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Gestão</p>
        <h1 className="mt-3 font-display text-3xl text-ink">O código</h1>
      </header>

      <div className="rounded-2xl border border-line/60 bg-surface p-6">
        <FormularioDeCodigo paraOnde={meioEscondido(email)} />
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        Se recebeu este código sem o ter pedido, alguém escreveu o seu endereço
        no ecrã de entrada. Sem o código não se entra.
      </p>
    </main>
  );
}
