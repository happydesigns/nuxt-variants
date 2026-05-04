export default defineAppConfig({
  variants: {
    article: {
      config: {
        hasDate: false,
        theme: { color: "green" },
        slots: ["app-article"],
      },
    },
    editorial: {
      extends: ["hero"],
      config: { tone: "app" },
    },
    extra: { config: { custom: 42 } },
  },
});
