interface BreadcrumbsConfig {
  breadcrumbSeparator: string
  breadcrumbShowHome: boolean
}

interface HeroConfig {
  heroHeight: 'sm' | 'md' | 'lg' | 'xl'
  heroOverlay: boolean
  heroAlign: 'left' | 'center' | 'right'
}

interface SeoConfig {
  titleTemplate: string
}

interface ArticleConfig {
  authorBox: boolean
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

declare module '#nuxt-variants' {
  interface CustomVariantRegistry {
    breadcrumbs: BreadcrumbsConfig
    hero: HeroConfig
    seo: SeoConfig
    toc: TocConfig
    sidebar: SidebarConfig
    article: BreadcrumbsConfig & HeroConfig & SeoConfig & ArticleConfig & TocConfig
    event: BreadcrumbsConfig & HeroConfig
    landing: HeroConfig & SidebarConfig
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    variant?: string
  }
}

declare function useVariantRegistry(): import('vue').ComputedRef<{
  name: string
  extends: string[]
  configKeys: string[]
}[]>

export {}
