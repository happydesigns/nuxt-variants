export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/styles.css"],
  modules: ["@nuxt/ui"],
  ui: { fonts: false, prose: true },
  icon: {
    clientBundle: {
      icons: [
        "lucide:search",
        "lucide:refresh-cw",
        "lucide:check",
        "lucide:loader-circle",
        "lucide:copy",
        "lucide:copy-check",
        "lucide:link",
        "lucide:git-branch",
        "lucide:arrow-right",
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
