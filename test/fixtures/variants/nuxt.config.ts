import MyModule from "../../../src/module";

export default defineNuxtConfig({
  modules: [MyModule],
  variants: {
    registry: {
      // Base features — no parents
      seo: { config: { indexed: true, seoScore: 90 } },
      hero: { config: { fullscreen: true, columns: 2 } },
      // Composite variant via explicit extends array
      article: { extends: ["seo", "hero"], config: { hasDate: true } },
      // Shorthand: array of parents, no own config
      event: ["seo", "hero"],
    },
  },
});
