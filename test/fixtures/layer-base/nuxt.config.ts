import MyModule from "../../../src/module";

export default defineNuxtConfig({
  $meta: {
    name: "test-base-layer",
  },
  modules: [MyModule],
  variants: {
    registry: {
      header: { config: { visible: true } },
      content: { extends: ["header"], config: { width: "prose" } },
    },
  },
});
