export default defineNuxtConfig({
  modules: ["../src/module", "@nuxt/content", "@nuxt/ui"],
  devtools: { enabled: true },
  compatibilityDate: "latest",
  css: ["~/assets/css/main.css"],

  variants: {
    configKey: "variants",
    registry: {
      breadcrumbs: {
        config: {
          breadcrumbSeparator: " / ",
          breadcrumbShowHome: true,
        },
      },

      hero: {
        config: {
          heroHeight: "md" as const,
          heroOverlay: false,
          heroAlign: "left" as const,
        },
      },

      seo: {
        config: {
          titleTemplate: "%s - My Site",
        },
      },

      article: {
        extends: ["breadcrumbs", "hero", "seo"],
        config: {
          heroHeight: "sm" as const,
          heroAlign: "left" as const,
          authorBox: true,
        },
      },

      event: {
        extends: ["breadcrumbs", "hero"],
        config: {
          heroHeight: "lg" as const,
          heroOverlay: true,
          heroAlign: "center" as const,
        },
      },

      landing: {
        extends: ["hero", "sidebar"],
        config: {
          heroHeight: "xl" as const,
          heroOverlay: true,
          heroAlign: "center" as const,
          sidebarPosition: "left" as const,
          sidebarCollapsible: true,
        },
      },
    },
  },
});
