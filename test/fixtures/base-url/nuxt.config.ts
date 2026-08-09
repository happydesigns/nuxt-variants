import MyModule from "../../../src/module";

export default defineNuxtConfig({
  app: {
    baseURL: "/nested/",
  },
  modules: [MyModule],
  variants: {
    registry: {
      content: {},
    },
  },
});
