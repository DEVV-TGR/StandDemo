import { defineConfig } from "drizzle-kit";
import { loadEnv } from "./src/db/load-env";

loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL em falta. Defina-a em .env.local (ver .env.example) antes de correr os comandos db:*.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  casing: "snake_case",
});
