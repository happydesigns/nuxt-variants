export default defineNuxtConfig({
  modules: ['nuxt-variants'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',

  variants: {
    configKey: 'variants',
    registry: {
      breadcrumbs: {
        config: {
          breadcrumbSeparator: ' / ',
          breadcrumbShowHome: true,
        },
      },

      hero: {
        config: {
          heroHeight: 'md' as const,
          heroOverlay: false,
          heroAlign: 'left' as const,
        },
      },

      article: {
        extends: ['breadcrumbs', 'hero'],
        config: {
          heroHeight: 'sm' as const,
          heroAlign: 'left' as const,
        },
      },
    },
  },
})
