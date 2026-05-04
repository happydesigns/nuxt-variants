export default defineAppConfig({
  variants: {
    article: {
      extends: ["breadcrumbs", "hero", "seo", "toc"],
      config: {
        heroHeight: "sm",
        heroAlign: "center",
        tocTitle: "Contents",
        authorBox: false,
      },
    },

    event: {
      extends: ["breadcrumbs", "hero"],
      config: {
        heroHeight: "lg",
        heroOverlay: true,
        heroAlign: "center",
      },
    },

    landing: {
      extends: ["hero", "sidebar"],
      config: {
        heroHeight: "xl",
        heroOverlay: true,
        heroAlign: "center",
        sidebarPosition: "left",
        sidebarWidth: 300,
        sidebarCollapsible: true,
      },
    },
  },
});
