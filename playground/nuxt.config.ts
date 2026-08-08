import { variantRegistry } from "./variants";

export default defineNuxtConfig({
  modules: ["../src/module", "@nuxt/content", "@nuxt/ui"],
  devtools: { enabled: true },
  compatibilityDate: "2026-05-04",
  css: ["~/assets/css/main.css"],

  variants: {
    configKey: "variants",
    registry: variantRegistry,
  },
});
