import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    { input: "./src/core", name: "core" },
    { input: "./src/content", name: "comark-content" },
    { input: "./src/devtools", name: "devtools" },
    { input: "./src/internal", name: "internal" },
    { input: "./src/inspector", name: "inspector" },
  ],
  declaration: true,
  rollup: { emitCJS: false },
});
