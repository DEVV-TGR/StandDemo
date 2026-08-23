import { redirect } from "next/navigation";
import { sessao } from "@/lib/painel/porta";
import { FormularioDeEntrada } from "@/components/admin/FormularioDeEntrada";

/*
  O ecrã de entrada.

  É a única página do painel que não chama `exigirSessao()` — seria um ciclo.
  Faz o contrário: quem já tem sessão não tem nada que fazer aqui e vai para
  dentro.

  Nada nesta página toca em variáveis de ambiente até o formulário ser
  submetido, e isso não é acaso: é o que permite ao CI abrir esta rota num
  ambiente sem um único segredo definido.
*/

export const metadata = { title: "Entrar" };

export default async function Entrar() {
  if (await sessao()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Gestão</p>
        <h1 className="mt-3 font-display text-3xl text-ink">Entrar no painel</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Escreva o seu email e receberá um código.
        </p>
      </header>

      <div className="rounded-2xl border border-line/60 bg-surface p-6">
        <FormularioDeEntrada />
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        Não há palavra-passe para decorar. Se o código não chegar, confirme o
        endereço e veja o spam.
      </p>
    </main>
  );
}
