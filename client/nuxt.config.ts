export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/styles.css"],
  modules: ["@nuxt/ui"],
  ui: { fonts: false, colorMode: false },
  icon: { clientBundle: { icons: ["lucide:search", "lucide:refresh-cw", "lucide:loader-circle"] } },
  app: {
    baseURL: "./",
    cdnURL: "./",
    head: {
      title: "Nuxt Variants DevTools",
      htmlAttrs: {
        class: "dark",
      },
    },
  },
  vite: {
    base: "./",
    resolve: {
      dedupe: ["vue", "@vue/runtime-core", "@vue/runtime-dom", "@vue/reactivity", "@vue/shared"],
    },
  },
  devtools: {
    enabled: false,
  },
  compatibilityDate: "2026-05-04",
});
