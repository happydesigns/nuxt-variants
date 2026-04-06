<template>
  <div :style="styles.page">
    <div :style="styles.header">
      <h1 :style="styles.title">nuxt-variants playground</h1>
      <p :style="styles.subtitle">A centralized, deeply-merging configuration engine for Nuxt layouts.</p>
    </div>

    <div :style="styles.grid">
      <NuxtLink
        v-for="v in variants"
        :key="v.name"
        :to="`/${v.name}`"
        :style="styles.card"
      >
        <div :style="styles.cardName">{{ v.name }}</div>
        <div :style="styles.cardExtends">extends: {{ v.extends.join(', ') }}</div>
        <div :style="styles.cardFeatures">
          <span v-for="f in v.features" :key="f" :style="styles.feature">{{ f }}</span>
        </div>
      </NuxtLink>
    </div>

    <div :style="styles.note">
      <strong>app.config override active:</strong> <code>article.tocMaxDepth</code> is overridden from
      <code>3 → 2</code> and <code>article.tocTitle</code> from <code>"On this page" → "Contents"</code>.
    </div>
  </div>
</template>

<script setup lang="ts">
const variants = [
  { name: 'article', extends: ['breadcrumbs', 'hero', 'toc'], features: ['breadcrumbs ✓', 'hero ✓', 'toc ✓', 'sidebar ✗'] },
  { name: 'event', extends: ['breadcrumbs', 'hero'], features: ['breadcrumbs ✓', 'hero ✓', 'toc ✗', 'sidebar ✗'] },
  { name: 'landing', extends: ['hero', 'sidebar'], features: ['breadcrumbs ✗', 'hero ✓', 'toc ✗', 'sidebar ✓'] },
]

const styles = {
  page: { fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc', padding: '48px 32px' },
  header: { maxWidth: '640px', marginBottom: '40px' },
  title: { margin: '0 0 12px', fontSize: '32px', fontWeight: '800', color: '#0f172a' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', maxWidth: '900px' },
  card: { display: 'block', padding: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', textDecoration: 'none', transition: 'box-shadow 0.2s' },
  cardName: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px', textTransform: 'capitalize' as const },
  cardExtends: { fontSize: '13px', color: '#94a3b8', marginBottom: '14px', fontFamily: 'monospace' },
  cardFeatures: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px' },
  feature: { fontSize: '12px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '10px', color: '#475569' },
  note: { marginTop: '32px', maxWidth: '640px', padding: '16px 20px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '14px', color: '#713f12' },
}
</script>
