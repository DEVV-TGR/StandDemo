import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  // Já autenticado? Vai direto para o painel.
  const sessao = await auth();
  if (sessao) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Imperio Auto Concept
          </p>
          <h1 className="font-display mt-3 text-3xl text-ink">
            Área de <span className="italic text-gold">gestão</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Introduza as suas credenciais para gerir as viaturas.
          </p>
        </div>

        <div className="border border-line bg-surface p-7">
          <LoginForm />
        </div>

        <div className="hairline mt-8" />
      </div>
    </div>
  );
}
