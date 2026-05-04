<script setup lang="ts">
definePageMeta({ layout: "content", variant: "landing" });

const { config } = useVariant("landing");
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h2 class="text-xl font-bold text-highlighted tracking-tight mb-2">Landing</h2>
      <p class="text-sm text-muted leading-relaxed">
        Calls
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default"
          >useVariant('landing')</code
        >
        with a literal string. The variant composes
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default"
          >hero</code
        >
        and
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default"
          >sidebar</code
        >
        to reuse the same layout for a very different page shape.
      </p>
    </div>

    <div class="border border-default rounded-sm overflow-hidden">
      <div class="px-4 py-2.5 border-b border-default bg-muted flex items-center gap-2 flex-wrap">
        <span class="font-mono text-xs text-dimmed uppercase tracking-widest"
          >runtime override</span
        >
        <span
          class="font-mono text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm"
          >sidebarPosition: left</span
        >
      </div>
      <p class="text-xs text-muted leading-relaxed px-4 py-3 m-0">
        The base sidebar defaults live in <code class="font-mono">nuxt.config.ts</code>.
        <code class="font-mono">app.config.ts</code> changes the landing page sidebar placement and
        width without adding a new layout.
      </p>
    </div>

    <div class="border border-default rounded-sm overflow-hidden">
      <div class="px-4 py-2.5 border-b border-default bg-muted">
        <span class="font-mono text-xs text-dimmed uppercase tracking-widest">Resolved config</span>
      </div>
      <div class="divide-y divide-default">
        <div
          v-for="[key, value] in Object.entries(config)"
          :key="key"
          class="flex items-center px-4 py-2.5 hover:bg-muted transition-colors gap-4"
        >
          <span class="font-mono text-xs text-toned w-48 shrink-0">{{ key }}</span>
          <span class="font-mono text-xs text-highlighted break-all">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
