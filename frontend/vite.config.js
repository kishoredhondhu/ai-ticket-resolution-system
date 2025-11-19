import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,

    environment: "jsdom",

    setupFiles: "./src/test/setup.ts",

    css: true,

    coverage: {
      provider: "v8",

      reporter: ["text", "json", "html", "lcov"],

      exclude: [
        "node_modules/",

        "src/test/",

        "**/*.d.ts",

        "**/*.config.*",

        "**/mockData",

        "dist/",

        "coverage/",

        "**/*.{test,spec}.{ts,tsx}",
      ],

      all: true,

      lines: 90,

      functions: 90,

      branches: 90,

      statements: 90,
    },
  },
});
