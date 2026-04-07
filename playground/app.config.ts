export default defineAppConfig({
  variants: {
    toc: {
      config: {
        tocMaxDepth: 3,
        tocSticky: true,
        tocTitle: "On this page",
      },
    },

    sidebar: {
      config: {
        sidebarPosition: "right",
        sidebarWidth: 280,
        sidebarCollapsible: false,
      },
    },

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
        sidebarCollapsible: true,
      },
    },
  },
});
