export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/styles.css"],
  app: {
    baseURL: "/__nuxt-variants/devtools/",
    head: {
      title: "Nuxt Variants DevTools",
    },
  },
  devtools: {
    enabled: false,
  },
  compatibilityDate: "2026-05-04",
});
