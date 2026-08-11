import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 8080,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dorinha: resolve(__dirname, "autora/dorinha-barroso/index.html"),
        dorinhaShort: resolve(__dirname, "dorinha-barroso/index.html"),
      },
    },
  },
  test: {
    // Os testes ponta a ponta rodam no Playwright, não no Vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "src/tests/e2e/**"],
  },
});
