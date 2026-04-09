<script setup lang="ts">
const { data: post } = await useAsyncData("hello-world", () => queryCollection("blog").first());

const { config: articleVariant, has } = useVariant("article");
const extendsSeo = has("seo");
</script>

<template>
  <div class="min-h-screen bg-default bg-grid">
    <!-- Top bar -->
    <div class="border-b border-default flex items-stretch h-11 bg-default">
      <NuxtLink
        to="/"
        class="flex items-center px-4 border-r border-default text-xs font-mono text-muted hover:text-highlighted hover:bg-muted transition-colors no-underline shrink-0"
      >
        ← variants
      </NuxtLink>
      <div class="flex items-center px-4 border-r border-default gap-2 shrink-0">
        <span class="font-mono text-xs text-dimmed">collection</span>
        <span class="font-mono text-xs text-muted">/</span>
        <span class="font-mono text-xs text-highlighted">blog</span>
      </div>
      <div class="flex items-center px-4 gap-2">
        <span class="font-mono text-xs text-dimmed">mergeVariantSchemas</span>
      </div>
    </div>

    <div class="max-w-3xl px-8 py-10 space-y-10">
      <!-- Schema merging -->
      <section>
        <div class="flex items-baseline gap-3 mb-5">
          <h2 class="text-xl font-bold text-highlighted tracking-tight m-0">
            Build-time schema merging
          </h2>
          <UBadge color="primary" variant="subtle" class="font-mono">SQLite-backed</UBadge>
        </div>
        <p class="text-sm text-muted leading-relaxed mb-5">
          <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default"
            >mergeVariantSchemas(['article'], variantSchemas, variantGraph)</code
          >
          walked the inheritance graph at build time (<code class="font-mono text-xs"
            >article → seo</code
          >) and produced a single Zod schema. Nuxt Content v3 used it to create the SQLite columns.
        </p>

        <div class="border border-default rounded-sm overflow-hidden">
          <div class="px-4 py-2.5 border-b border-default bg-muted flex items-center gap-2">
            <span class="font-mono text-xs text-dimmed">content/blog/hello-world.md</span>
          </div>
          <div class="divide-y divide-default">
            <div class="flex items-center px-4 py-3 hover:bg-muted transition-colors">
              <span class="font-mono text-xs text-muted w-36 shrink-0">seoTitle</span>
              <span class="font-mono text-xs text-highlighted flex-1">{{ post?.seoTitle }}</span>
              <span class="font-mono text-[10px] text-dimmed">from seo schema</span>
            </div>
            <div class="flex items-center px-4 py-3 hover:bg-muted transition-colors">
              <span class="font-mono text-xs text-muted w-36 shrink-0">authorName</span>
              <span class="font-mono text-xs text-highlighted flex-1">{{ post?.authorName }}</span>
              <span class="font-mono text-[10px] text-dimmed">from article schema</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Runtime config -->
      <section>
        <div class="flex items-baseline gap-3 mb-5">
          <h2 class="text-xl font-bold text-highlighted tracking-tight m-0">
            Runtime variant config
          </h2>
          <UBadge color="success" variant="subtle" class="font-mono">reactive</UBadge>
        </div>
        <p class="text-sm text-muted leading-relaxed mb-5">
          <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default"
            >useVariant('article')</code
          >
          deeply merges registry + <code class="font-mono text-xs">app.config.ts</code> at runtime.
          The app config sets <code class="font-mono text-xs">authorBox: false</code>, overriding
          the nuxt.config default of <code class="font-mono text-xs">true</code>.
          <br class="mb-2" />
          <code
            class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default mt-2 inline-block"
            >has('seo')</code
          >
          returns <strong class="text-highlighted font-mono text-xs">{{ extendsSeo }}</strong> — the
          inheritance graph is also reactive at runtime.
        </p>

        <div class="border border-default rounded-sm overflow-hidden">
          <div class="px-4 py-2.5 border-b border-default bg-muted">
            <span class="font-mono text-xs text-dimmed">useVariant('article')</span>
          </div>
          <div class="divide-y divide-default">
            <div
              v-for="[key, value] in Object.entries(articleVariant)"
              :key="key"
              class="flex items-center px-4 py-2.5 hover:bg-muted transition-colors"
            >
              <span class="font-mono text-xs text-muted w-48 shrink-0">{{ key }}</span>
              <span class="font-mono text-xs text-highlighted flex-1">{{ value }}</span>
              <span
                v-if="key === 'authorBox'"
                class="font-mono text-[10px] px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-sm"
                >app.config override</span
              >
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
