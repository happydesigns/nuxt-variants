<script setup lang="ts">
const { data: post } = await useAsyncData("hello-world", () => queryCollection("blog").first());

const articleVariant = useVariant("article");
const extendsSeo = useVariantExtends("article", "seo");
</script>

<template>
  <div :style="styles.page">
    <nav :style="styles.nav">
      <NuxtLink to="/" :style="styles.navLink">← All variants</NuxtLink>
      <span :style="styles.badge">Nuxt Content v3</span>
      <span :style="styles.badge">mergeVariantSchemas</span>
    </nav>

    <div :style="styles.content">
      <section :style="styles.section">
        <h2 :style="styles.sectionTitle">Build-time schema merging</h2>
        <p :style="styles.desc">
          <code>mergeVariantSchemas(['article'], variantSchemas, variantGraph)</code> walked the
          inheritance graph at build time (<code>article → seo</code>) and produced a single Zod
          schema with both fields. Nuxt Content v3 used it to create the SQLite columns.
        </p>

        <div :style="styles.card">
          <div :style="styles.cardHeader">
            <span :style="styles.cardTitle">content/blog/hello-world.md</span>
            <span :style="styles.pill">SQLite-backed</span>
          </div>
          <table :style="styles.table">
            <tr>
              <td :style="styles.key"><code>seoTitle</code></td>
              <td :style="styles.value">{{ post?.seoTitle }}</td>
              <td :style="styles.source">from <code>seo</code> schema</td>
            </tr>
            <tr>
              <td :style="styles.key"><code>authorName</code></td>
              <td :style="styles.value">{{ post?.authorName }}</td>
              <td :style="styles.source">from <code>article</code> schema</td>
            </tr>
          </table>
        </div>
      </section>

      <section :style="styles.section">
        <h2 :style="styles.sectionTitle">Runtime variant config</h2>
        <p :style="styles.desc">
          <code>useVariant('article')</code> deeply merges the registry and
          <code>app.config.ts</code> override at runtime. The <code>app.config.ts</code> sets
          <code>authorBox: false</code>, overriding the <code>nuxt.config.ts</code> default of
          <code>true</code>.
          <br />
          <code>useVariantExtends('article', 'seo')</code> returns
          <strong>{{ extendsSeo }}</strong> — proving the inheritance graph is also available
          reactively at runtime.
        </p>

        <div :style="styles.card">
          <div :style="styles.cardHeader">
            <span :style="styles.cardTitle">useVariant('article')</span>
            <span :style="{ ...styles.pill, background: '#d1fae5', color: '#065f46' }"
              >reactive</span
            >
          </div>
          <table :style="styles.table">
            <tr v-for="(val, key) in articleVariant" :key="key">
              <td :style="styles.key">
                <code>{{ key }}</code>
              </td>
              <td :style="styles.value">{{ val }}</td>
              <td :style="styles.source">
                <span v-if="key === 'authorBox'" :style="styles.override">app.config override</span>
              </td>
            </tr>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
const styles = {
  page: { fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 24px",
    background: "#1e293b",
    color: "#94a3b8",
  },
  navLink: { color: "#7dd3fc", textDecoration: "none", fontSize: "14px" },
  badge: {
    fontSize: "12px",
    padding: "2px 8px",
    background: "#334155",
    borderRadius: "6px",
    color: "#e2e8f0",
  },
  content: { padding: "40px 32px", maxWidth: "800px" },
  section: { marginBottom: "48px" },
  sectionTitle: { margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "#0f172a" },
  desc: { margin: "0 0 20px", fontSize: "14px", color: "#64748b", lineHeight: "1.7" },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  cardTitle: { fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: "#1e293b" },
  pill: {
    fontSize: "11px",
    padding: "2px 8px",
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "10px",
    fontWeight: "600",
  },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" },
  key: {
    padding: "10px 20px",
    color: "#64748b",
    fontFamily: "monospace",
    width: "160px",
    borderBottom: "1px solid #f1f5f9",
  },
  value: {
    padding: "10px 16px",
    color: "#0f172a",
    fontWeight: "600",
    fontFamily: "monospace",
    borderBottom: "1px solid #f1f5f9",
  },
  source: {
    padding: "10px 20px",
    color: "#94a3b8",
    fontSize: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  override: {
    padding: "1px 7px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "6px",
    fontWeight: "600",
  },
};
</script>
