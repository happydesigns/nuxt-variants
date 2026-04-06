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

      toc: {
        config: {
          tocMaxDepth: 3,
          tocSticky: true,
          tocTitle: 'On this page',
        },
      },

      sidebar: {
        config: {
          sidebarPosition: 'right' as const,
          sidebarWidth: 280,
          sidebarCollapsible: false,
        },
      },

      article: {
        extends: ['breadcrumbs', 'hero', 'toc'],
        config: {
          heroHeight: 'sm' as const,
        },
      },

      event: {
        extends: ['breadcrumbs', 'hero'],
        config: {
          heroHeight: 'lg' as const,
          heroOverlay: true,
          heroAlign: 'center' as const,
        },
      },

      landing: {
        extends: ['hero', 'sidebar'],
        config: {
          heroHeight: 'xl' as const,
          heroOverlay: true,
          heroAlign: 'center' as const,
          sidebarPosition: 'left' as const,
          sidebarCollapsible: true,
        },
      },
    },
  },
})
