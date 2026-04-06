declare module 'nuxt-variants' {
  interface BreadcrumbsConfig {
    breadcrumbSeparator: string
    breadcrumbShowHome: boolean
  }

  interface HeroConfig {
    heroHeight: 'sm' | 'md' | 'lg' | 'xl'
    heroOverlay: boolean
    heroAlign: 'left' | 'center' | 'right'
  }

  interface TocConfig {
    tocMaxDepth: number
    tocSticky: boolean
    tocTitle: string
  }

  interface SidebarConfig {
    sidebarPosition: 'left' | 'right'
    sidebarWidth: number
    sidebarCollapsible: boolean
  }

  interface CustomVariantRegistry {
    breadcrumbs: BreadcrumbsConfig
    hero: HeroConfig
    toc: TocConfig
    sidebar: SidebarConfig
    article: BreadcrumbsConfig & HeroConfig & TocConfig
    event: BreadcrumbsConfig & HeroConfig
    landing: HeroConfig & SidebarConfig
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    variant?: string
  }
}

declare function useVariantRegistry(): {
  name: string
  extends: string[]
  configKeys: string[]
}[]

export {}
