export default defineNuxtConfig({
  extends: ["../layer-base"],
  variants: {
    registry: {
      content: {
        config: { consumer: true },
      },
      article: {
        extends: ["content"],
        config: { kind: "article" },
      },
    },
  },
});
