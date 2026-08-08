export const variantRegistry = {
  breadcrumbs: {
    config: {
      breadcrumbSeparator: " / ",
      breadcrumbShowHome: true,
    },
  },
  hero: {
    config: {
      heroHeight: "md",
      heroOverlay: false,
      heroAlign: "left",
    },
  },
  toc: {
    config: {
      tocMaxDepth: 2,
      tocSticky: false,
      tocTitle: "On this page",
    },
  },
  sidebar: {
    config: {
      sidebarPosition: "right",
      sidebarWidth: 260,
      sidebarCollapsible: false,
    },
  },
  seo: {
    config: {
      titleTemplate: "%s - My Site",
    },
  },
  article: {
    extends: ["breadcrumbs", "hero", "seo", "toc"],
    config: {
      heroHeight: "sm",
      heroAlign: "left",
      articleLayout: "stacked",
      authorBox: true,
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
};
