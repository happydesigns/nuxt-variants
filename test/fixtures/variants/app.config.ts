export default defineAppConfig({
  variants: {
    // Override: flip hasDate to false to verify app.config wins over nuxt.config
    article: { config: { hasDate: false } },
    // Runtime-only variant that only exists in app.config
    extra: { config: { custom: 42 } },
  },
});
