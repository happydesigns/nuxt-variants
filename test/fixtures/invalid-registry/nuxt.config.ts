import NuxtVariants from "../../../src/module";

export default defineNuxtConfig({
  modules: [NuxtVariants],
  variants: {
    registry: {
      article: { extends: ["missing"] },
    },
  },
});
