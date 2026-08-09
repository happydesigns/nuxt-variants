export default defineNuxtConfig({
  extends: ["../layer-base"],
  variants: {
    registry: {
      article: {
        extends: ["content"],
        config: { kind: "article" },
      },
    },
  },
});
