export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/styles.css"],
  modules: ["@nuxt/devtools-ui-kit"],
  app: {
    baseURL: "/__nuxt-variants/devtools/",
    head: {
      title: "Nuxt Variants DevTools",
      htmlAttrs: {
        class: "dark",
      },
    },
  },
  devtools: {
    enabled: false,
  },
  compatibilityDate: "2026-05-04",
});
