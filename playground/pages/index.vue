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
          <span :style="styles.cardName">{{ f.name }}</span>
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
          <span :style="styles.cardName">{{ v.name }}</span>
          <div :style="styles.extendsRow">
            <span v-for="p in v.extends" :key="p" :style="styles.parentBadge">{{ p }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const registry = useVariantRegistry()

type RegistryEntry = ReturnType<typeof useVariantRegistry>[number]

const features = computed(() => registry.filter((v: RegistryEntry) => !v.extends.length))
const layouts = computed(() => registry.filter((v: RegistryEntry) => v.extends.length > 0))

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
  cardName: { display: 'block', fontSize: '16px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' as const, marginBottom: '10px' },
  configKeys: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px' },
  configKey: { fontSize: '11px', padding: '1px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#475569', fontFamily: 'monospace' },
  extendsRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px' },
  parentBadge: { fontSize: '12px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '10px', color: '#475569' },
}
</script>
