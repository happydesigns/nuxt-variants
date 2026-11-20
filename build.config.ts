import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    { input: "./src/schemas", name: "schemas" },
    { input: "./src/portable/core", name: "core" },
    { input: "./src/portable/content", name: "comark-content" },
    { input: "./src/portable/devtools", name: "devtools" },
    { input: "./src/portable/internal", name: "internal" },
    { input: "./src/portable/inspector", name: "inspector" },
  ],
  externals: [/^@happydesigns\/composable-variants\//],
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
