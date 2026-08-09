<script setup lang="ts">
import type { VariantSource } from "~/types/devtools";

defineProps<{
  sources: readonly VariantSource[];
}>();
</script>

<template>
  <NCard>
    <div class="panel-head">
      <h2>Declared in</h2>
      <p>Nuxt configuration sources in precedence order.</p>
    </div>

    <div v-if="sources.length" class="source-list">
      <article v-for="source in sources" :key="`${source.kind}:${source.name}`" class="source-item">
        <div class="source-heading">
          <strong>{{ source.name }}</strong>
          <NBadge :n="source.kind === 'application' ? 'green' : 'gray'">
            {{ source.kind }}
          </NBadge>
        </div>
        <div class="source-meta">
          <span>{{ source.entry.extends?.length ?? 0 }} parents</span>
          <span>{{ Object.keys(source.entry.config).length }} config keys</span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">No source information is available.</div>
  </NCard>
</template>
