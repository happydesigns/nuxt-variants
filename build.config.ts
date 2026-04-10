import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      input: "./src/schemas",
      name: "schemas",
    },
  ],
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
