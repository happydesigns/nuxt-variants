import MyModule from "../../../src/module";

export default defineNuxtConfig({
  modules: [MyModule],
  variants: {
    registry: {
      seo: { config: { indexed: true, seoScore: 90 } },
      hero: { config: { fullscreen: true, columns: 2 } },
      design: {
        config: {
          theme: { color: "blue", density: "default", tokens: ["base"] },
          slots: ["header", "main"],
          collision: "design",
        },
      },
      article: {
        extends: ["seo", "hero", "design"],
        config: {
          hasDate: true,
          theme: { density: "comfortable", tokens: ["article"] },
          slots: ["article"],
          collision: "article",
        },
      },
      event: ["seo", "hero"],
      gallery: { extends: "hero", config: { layout: "gallery" } },
      editorial: { extends: ["seo"], config: { tone: "base" } },
      inactive: { active: false, config: { hidden: true } },
    },
  },
});
