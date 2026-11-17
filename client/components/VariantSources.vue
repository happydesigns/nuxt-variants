<script setup lang="ts">
import type { VariantSource } from "~/types/devtools";

defineProps<{
  sources: readonly VariantSource[];
}>();
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <div class="panel-head">
      <h2>Declared in</h2>
      <p>Configuration sources in precedence order.</p>
    </div>

    <div v-if="sources.length" class="source-list">
      <article v-for="source in sources" :key="`${source.kind}:${source.name}`" class="source-item">
        <div class="source-heading">
          <strong>{{ source.name }}</strong>
          <UBadge :color="source.kind === 'application' ? 'success' : 'neutral'">
            {{ source.kind }}
          </UBadge>
        </div>
        <div class="source-meta">
          <span>{{ source.entry.extends?.length ?? 0 }} parents</span>
          <span>{{ Object.keys(source.entry.config).length }} config keys</span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">No source information is available.</div>
  </UCard>
</template>
