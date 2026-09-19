import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              message: "Import from 'motion/react' instead.",
            },
            {
              name: "@supabase/auth-helpers-nextjs",
              message: "Import from '@supabase/ssr' instead.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "node_modules/**", "scripts/**"]),
]);

export default eslintConfig;
