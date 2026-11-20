import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, ".tmp/**", ".temp/**"],
    benchmark: { include: ["test/bench/**/*.bench.ts"], exclude: [".tmp/**", ".temp/**"] },
  },
});
