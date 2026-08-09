import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "::",
    port: 8080,
  },
  test: {
    // Os testes ponta a ponta rodam no Playwright, não no Vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "src/tests/e2e/**"],
  },
});
