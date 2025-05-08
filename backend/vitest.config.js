// vitest.config.js
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./vitest.setup.js", // optional
  },
});
