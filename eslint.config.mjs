import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  /*
    O inventário tem uma porta só: `src/lib/viaturas.ts`.

    Sem esta regra, a fronteira dura até ao PR seguinte — importar
    `@/data/viaturas` é sempre o caminho mais curto, e uma convenção que só
    existe na cabeça de quem a escreveu não é uma convenção.

    Importa a sério por duas razões. Quando o inventário passar a vir da base
    de dados, quem tiver ficado agarrado ao ficheiro serve dados velhos sem
    ninguém dar por isso. E `CatalogoClient` e `HeroSearch` são componentes de
    cliente: um import directo mete as 448 linhas do ficheiro no bundle que
    vai para o browser.

    A excepção é `src/lib/` e `src/db/` — a porta única, e mais tarde o seed.
  */
  {
    files: ["src/app/**", "src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/data/viaturas"],
              message:
                "O inventário lê-se por src/lib/viaturas.ts (getViaturas, getViatura, getDestaques, getSugestoes), nunca directamente.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
