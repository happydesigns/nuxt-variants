import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      input: "./src/schemas",
      name: "schemas",
    },
    { input: "./src/core", name: "core" },
    { input: "./src/content", name: "content" },
    { input: "./src/devtools", name: "devtools" },
  ],
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
