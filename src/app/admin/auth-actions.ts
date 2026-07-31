"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type EstadoLogin = { erro?: string };

export async function autenticar(
  _estado: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (erro) {
    // signIn lança um redirect em caso de sucesso — deixar propagar.
    if (erro instanceof AuthError) {
      return { erro: "Email ou palavra-passe inválidos." };
    }
    throw erro;
  }
}

export async function terminarSessao(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
