import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],

  // @ts-expect-error - Vitest config extension

  test: {
    globals: true,

    environment: "happy-dom",

    setupFiles: "./src/test/setup.ts",

    css: true,

    testTimeout: 10000,

    hookTimeout: 10000,

    teardownTimeout: 10000,

    isolate: false,

    pool: "threads",

    poolOptions: {
      threads: {
        singleThread: true,

        maxThreads: 1,

        minThreads: 1,
      },
    },

    maxConcurrency: 1,

    fileParallelism: false,

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

      include: ["src/**/*.{ts,tsx}"],

      thresholds: {
        lines: 55,

        functions: 55,

        branches: 30,

        statements: 55,
      },
    },
  },
});
