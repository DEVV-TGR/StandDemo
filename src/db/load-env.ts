import { readFileSync } from "node:fs";

// Carrega variáveis de um ficheiro .env para process.env (sem dependências).
// Usado pelas ferramentas de linha de comando (drizzle-kit, seed) — a app Next
// já carrega .env.local automaticamente, por isso isto não corre em runtime.
export function loadEnv(file = ".env.local"): void {
  let content: string;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    return; // sem ficheiro — assume env já definido no ambiente (ex.: CI, Vercel)
  }
  for (const linha of content.split("\n")) {
    const match = linha.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const chave = match[1];
    let valor = match[2];
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!(chave in process.env)) process.env[chave] = valor;
  }
}
