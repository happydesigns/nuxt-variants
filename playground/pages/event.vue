<script setup lang="ts">
definePageMeta({ layout: "content", variant: "event" });

const { config } = useVariant("event");
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h2 class="text-xl font-bold text-highlighted tracking-tight mb-2">Event</h2>
      <p class="text-sm text-muted leading-relaxed">
        Calls <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">useVariant('event')</code> with a literal string.
        TypeScript infers the merged type across <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">breadcrumbs</code> and
        <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border border-default">hero</code> — no cast needed.
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
