export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/styles.css"],
  modules: ["@nuxt/ui"],
  ui: { fonts: false },
  icon: {
    clientBundle: {
      icons: [
        "lucide:search",
        "lucide:refresh-cw",
        "lucide:loader-circle",
        "lucide:chevron-right",
        "lucide:git-branch",
        "lucide:menu",
        "lucide:panel-left-close",
        "lucide:panel-left-open",
        "lucide:x",
      ],
    },
  },
  app: {
    cdnURL: "./",
    head: {
      title: "Composable Variants DevTools",
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
