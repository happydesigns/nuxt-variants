<script setup lang="ts">
definePageMeta({ layout: "content", variant: "article" });

const { config } = useVariant("article");
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h2 class="text-xl font-bold text-highlighted tracking-tight mb-2">Article</h2>
      <p class="text-sm text-muted leading-relaxed">
        Calls <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">useVariant('article')</code> with a literal string.
        TypeScript infers the merged type across <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">breadcrumbs</code>,
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">hero</code>,
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">seo</code>, and
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">toc</code> — no cast needed.
      </p>
    </div>

    <div class="border border-default rounded-sm overflow-hidden">
      <div class="px-4 py-2.5 border-b border-default bg-muted flex items-center gap-2">
        <span class="font-mono text-xs text-dimmed uppercase tracking-widest">app.config override</span>
        <span class="font-mono text-[10px] px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-sm">authorBox: false</span>
      </div>
      <p class="text-xs text-muted leading-relaxed px-4 py-3 m-0">
        <code class="font-mono">app.config.ts</code> extends the article chain to also include <code class="font-mono">toc</code>,
        and overrides <code class="font-mono">authorBox</code> from <code class="font-mono">true</code> → <code class="font-mono">false</code>.
      </p>
    </div>

    <div class="border border-default rounded-sm overflow-hidden">
      <div class="px-4 py-2.5 border-b border-default bg-muted">
        <span class="font-mono text-xs text-dimmed uppercase tracking-widest">Resolved config</span>
      </div>
      <div class="divide-y divide-default">
        <div v-for="[key, value] in Object.entries(config)" :key="key" class="flex items-center px-4 py-2.5 hover:bg-muted transition-colors">
          <span class="font-mono text-xs text-toned w-48 shrink-0">{{ key }}</span>
          <span class="font-mono text-xs text-highlighted">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
