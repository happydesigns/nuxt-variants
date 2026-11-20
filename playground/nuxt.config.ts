import { fileURLToPath } from "node:url";
import { variantRegistry } from "./variants";

export default defineNuxtConfig({
  modules: ["../src/module", "@nuxt/content", "@nuxt/ui"],
  devtools: { enabled: true },
  compatibilityDate: "2026-05-04",
  css: ["~/assets/css/main.css"],
  nitro: {
    serverAssets: [
      {
        baseName: "editorial",
        dir: fileURLToPath(new URL("./editorial", import.meta.url)),
      },
    ],
  },

  variants: {
    devtools: "devframe",
    configKey: "variants",
    registry: variantRegistry,
  },
});
