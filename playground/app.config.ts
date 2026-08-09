export default defineAppConfig({
  variants: {
    article: {
      config: {
        heroHeight: "sm",
        heroAlign: "center",
        tocTitle: "Contents",
        authorBox: false,
      },
    },

    event: {
      config: {
        heroHeight: "lg",
        heroOverlay: true,
        heroAlign: "center",
      },
    },

    landing: {
      config: {
        heroHeight: "xl",
        heroOverlay: true,
        heroAlign: "center",
        sidebarPosition: "left",
        sidebarWidth: 300,
        sidebarCollapsible: true,
      },
    },

    preview: {
      config: {
        previewMode: true,
      },
    },
  },
});
