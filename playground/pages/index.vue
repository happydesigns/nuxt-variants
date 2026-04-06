<template>
  <div :style="styles.page">
    <div :style="styles.header">
      <h1 :style="styles.title">nuxt-variants playground</h1>
      <p :style="styles.subtitle">A centralized, deeply-merging configuration engine for Nuxt layouts.</p>
    </div>

    <section :style="styles.section">
      <h2 :style="styles.sectionTitle">Features</h2>
      <p :style="styles.sectionDesc">Base building blocks — no <code>extends</code>, just config defaults.</p>
      <div :style="styles.grid">
        <div v-for="f in features" :key="f.name" :style="styles.featureCard">
          <div :style="styles.cardRow">
            <span :style="styles.cardName">{{ f.name }}</span>
            <span :style="sourceBadgeStyle(f.source)">{{ f.source }}</span>
          </div>
          <div :style="styles.configKeys">
            <code v-for="k in f.configKeys" :key="k" :style="styles.configKey">{{ k }}</code>
          </div>
        </div>
      </div>
    </section>

    <section :style="styles.section">
      <h2 :style="styles.sectionTitle">Layout variants</h2>
      <p :style="styles.sectionDesc">Compose features and override config. Click to preview.</p>
      <div :style="styles.grid">
        <NuxtLink
          v-for="v in layouts"
          :key="v.name"
          :to="`/${v.name}`"
          :style="styles.layoutCard"
        >
          <div :style="styles.cardRow">
            <span :style="styles.cardName">{{ v.name }}</span>
            <span :style="sourceBadgeStyle(v.source)">{{ v.source }}</span>
          </div>
          <div :style="styles.extendsRow">
            <span v-for="p in v.extends" :key="p" :style="styles.parentBadge">{{ p }}</span>
          </div>
          <div v-if="v.source === 'both'" :style="styles.overrideNote">
            app.config extends the chain and overrides config
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const registry = useVariantRegistry()

type RegistryEntry = ReturnType<typeof useVariantRegistry>[number]
type VariantSource = RegistryEntry['source']

const features = computed(() => registry.filter((v: RegistryEntry) => !v.extends.length))
const layouts = computed(() => registry.filter((v: RegistryEntry) => v.extends.length > 0))

const sourceColors = {
  'nuxt.config': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'app.config': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'both': { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
} satisfies Record<VariantSource, { bg: string, color: string, border: string }>

function sourceBadgeStyle(source: VariantSource) {
  const c = sourceColors[source]
  return { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }
}

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc', padding: '48px 32px' },
  header: { maxWidth: '640px', marginBottom: '48px' },
  title: { margin: '0 0 12px', fontSize: '32px', fontWeight: '800', color: '#0f172a' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '16px' },
  section: { marginBottom: '48px' },
  sectionTitle: { margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#0f172a' },
  sectionDesc: { margin: '0 0 20px', fontSize: '14px', color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxWidth: '960px' },
  featureCard: { padding: '18px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' },
  layoutCard: { display: 'block', padding: '18px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', textDecoration: 'none' },
  cardRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  cardName: { fontSize: '16px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' as const },
  configKeys: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px' },
  configKey: { fontSize: '11px', padding: '1px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#475569', fontFamily: 'monospace' },
  extendsRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginBottom: '8px' },
  parentBadge: { fontSize: '12px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '10px', color: '#475569' },
  overrideNote: { fontSize: '11px', color: '#7e22ce', marginTop: '6px' },
}
</script>
