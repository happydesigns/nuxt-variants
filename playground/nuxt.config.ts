export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/content'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',

  variants: {
    configKey: 'variants',
    registry: {
      seo: {
        config: {
          titleTemplate: '%s - My Site',
        },
      },

      article: {
        extends: ['seo'],
        config: {
          authorBox: true,
        },
      },
    },
  },
})
