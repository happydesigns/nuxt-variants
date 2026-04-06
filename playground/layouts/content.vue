<template>
  <div :style="styles.page">
    <nav :style="styles.nav">
      <NuxtLink
        to="/"
        :style="styles.navLink"
      >← All variants</NuxtLink>
      <span :style="styles.badge">layout: content</span>
      <span :style="styles.badge">variant: {{ variantName }}</span>
    </nav>

    <div
      v-if="hasBreadcrumbs"
      :style="styles.breadcrumbs"
    >
      <span v-if="config.breadcrumbShowHome">🏠 Home</span>
      <span>{{ config.breadcrumbSeparator }}</span>
      <span>{{ variantName }}</span>
    </div>

    <div
      :style="{
        ...styles.hero,
        minHeight: heroHeights[config.heroHeight ?? 'md'],
        alignItems: config.heroAlign === 'center' ? 'center' : config.heroAlign === 'right' ? 'flex-end' : 'flex-start',
        background: config.heroOverlay
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }"
    >
      <div :style="styles.heroContent">
        <p :style="styles.heroLabel">
          hero · height: {{ config.heroHeight }} · overlay: {{ config.heroOverlay }}
        </p>
        <slot name="hero-title">
          <h1 :style="styles.heroTitle">
            {{ pageTitle }}
          </h1>
        </slot>
        <slot name="hero-subtitle" />
      </div>
    </div>

    <div :style="styles.body">
      <aside
        v-if="hasSidebar"
        :style="{
          ...styles.sidebar,
          order: config.sidebarPosition === 'left' ? -1 : 1,
          width: `${config.sidebarWidth}px`,
        }"
      >
        <div :style="styles.sidebarInner">
          <h3 :style="styles.sidebarTitle">
            Sidebar
          </h3>
          <p :style="styles.sidebarMeta">
            position: {{ config.sidebarPosition }}
          </p>
          <p :style="styles.sidebarMeta">
            width: {{ config.sidebarWidth }}px
          </p>
          <p :style="styles.sidebarMeta">
            collapsible: {{ config.sidebarCollapsible }}
          </p>
          <slot name="sidebar" />
        </div>
      </aside>

      <main :style="styles.main">
        <slot />
      </main>

      <aside
        v-if="hasToc"
        :style="{
          ...styles.toc,
          position: config.tocSticky ? 'sticky' : 'static',
        }"
      >
        <h3 :style="styles.tocTitle">
          {{ config.tocTitle }}
        </h3>
        <p :style="styles.tocMeta">
          maxDepth: {{ config.tocMaxDepth }}
        </p>
        <p :style="styles.tocMeta">
          sticky: {{ config.tocSticky }}
        </p>
        <ul :style="styles.tocList">
          <li>Introduction</li>
          <li>Section 1</li>
          <li v-if="(config.tocMaxDepth ?? 1) >= 2">
            → Subsection 1.1
          </li>
          <li v-if="(config.tocMaxDepth ?? 1) >= 3">
            →→ Deep section 1.1.1
          </li>
          <li>Section 2</li>
        </ul>
        <slot name="toc" />
      </aside>
    </div>

    <div :style="styles.debugPanel">
      <h3 :style="styles.debugTitle">
        Resolved config
      </h3>
      <table :style="styles.debugTable">
        <tr
          v-for="(value, key) in config"
          :key="key"
        >
          <td :style="styles.debugKey">
            {{ key }}
          </td>
          <td :style="styles.debugValue">
            {{ value }}
          </td>
        </tr>
      </table>
      <template v-if="hasToc">
        <h3 :style="{ ...styles.debugTitle, marginTop: '12px' }">
          toc feature defaults
        </h3>
        <table :style="styles.debugTable">
          <tr
            v-for="(value, key) in tocConfig"
            :key="key"
          >
            <td :style="styles.debugKey">
              {{ key }}
            </td>
            <td :style="styles.debugValue">
              {{ value }}
            </td>
          </tr>
        </table>
      </template>
      <h3 :style="{ ...styles.debugTitle, marginTop: '12px' }">
        Feature flags
      </h3>
      <div :style="styles.flags">
        <span :style="flagStyle(hasBreadcrumbs)">breadcrumbs {{ hasBreadcrumbs ? '✓' : '✗' }}</span>
        <span :style="flagStyle(hasHero)">hero {{ hasHero ? '✓' : '✗' }}</span>
        <span :style="flagStyle(hasToc)">toc {{ hasToc ? '✓' : '✗' }}</span>
        <span :style="flagStyle(hasSidebar)">sidebar {{ hasSidebar ? '✓' : '✗' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'

interface LayoutConfig {
  breadcrumbSeparator?: string
  breadcrumbShowHome?: boolean
  heroHeight?: string
  heroOverlay?: boolean
  heroAlign?: string
  tocMaxDepth?: number
  tocSticky?: boolean
  tocTitle?: string
  sidebarPosition?: string
  sidebarWidth?: number
  sidebarCollapsible?: boolean
}

const route = useRoute()

const variantName = computed(() => route.meta.variant ?? 'unknown')
const pageTitle = computed(() => String(variantName.value).charAt(0).toUpperCase() + String(variantName.value).slice(1))

const config = useVariant(variantName) as ComputedRef<LayoutConfig>
const tocConfig = useVariant('toc')

const hasBreadcrumbs = useVariantExtends(variantName, 'breadcrumbs')
const hasHero = useVariantExtends(variantName, 'hero')
const hasToc = useVariantExtends(variantName, 'toc')
const hasSidebar = useVariantExtends(variantName, 'sidebar')

const heroHeights: Record<string, string> = {
  sm: '160px',
  md: '260px',
  lg: '360px',
  xl: '460px',
}

function flagStyle(active: boolean) {
  return {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: active ? '#d1fae5' : '#fee2e2',
    color: active ? '#065f46' : '#991b1b',
    marginRight: '6px',
  }
}

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc' },
  nav: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: '#1e293b', color: '#94a3b8' },
  navLink: { color: '#7dd3fc', textDecoration: 'none', fontSize: '14px' },
  badge: { fontSize: '12px', padding: '2px 8px', background: '#334155', borderRadius: '6px', color: '#e2e8f0' },
  breadcrumbs: { padding: '10px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b', display: 'flex', gap: '6px' },
  hero: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end', padding: '32px', color: '#fff', transition: 'min-height 0.3s' },
  heroContent: { maxWidth: '640px' },
  heroLabel: { fontSize: '11px', opacity: 0.6, marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' as const },
  heroTitle: { margin: 0, fontSize: '36px', fontWeight: '800' },
  body: { display: 'flex', gap: '0', alignItems: 'flex-start', minHeight: '400px' },
  sidebar: { flexShrink: 0, background: '#f1f5f9', borderRight: '1px solid #e2e8f0', minHeight: '400px' },
  sidebarInner: { padding: '24px 20px' },
  sidebarTitle: { margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#374151' },
  sidebarMeta: { margin: '4px 0', fontSize: '12px', color: '#64748b' },
  main: { flex: 1, padding: '32px' },
  toc: { width: '220px', flexShrink: 0, top: '16px', padding: '20px 16px', background: '#fff', borderLeft: '1px solid #e2e8f0', minHeight: '200px' },
  tocTitle: { margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' as const },
  tocMeta: { margin: '2px 0', fontSize: '11px', color: '#94a3b8' },
  tocList: { paddingLeft: '16px', margin: '12px 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.8' },
  debugPanel: { margin: '32px', padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' },
  debugTitle: { margin: '0 0 10px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, color: '#94a3b8', letterSpacing: '0.08em' },
  debugTable: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  debugKey: { padding: '4px 12px 4px 0', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' as const },
  debugValue: { padding: '4px 0', color: '#1e293b', fontWeight: '500', fontFamily: 'monospace' },
  flags: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px' },
}
</script>
