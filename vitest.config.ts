import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The "server-only" marker package throws unconditionally outside
      // Next's bundler (which aliases it away for server compilation).
      // Vitest runs in plain Node, so it needs the same no-op here.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    passWithNoTests: true,
  },
});
