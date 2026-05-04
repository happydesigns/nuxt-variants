<script setup lang="ts">
import type { DevtoolsData } from "~/types/devtools";

defineProps<{
  connected: boolean;
  data: DevtoolsData;
  selected?: string;
}>();

const emit = defineEmits<{
  "update:selected": [value: string];
}>();
</script>

<template>
  <aside class="sidebar">
    <div class="header">
      <div class="eyebrow">Nuxt Variants</div>
      <h1>Variant graph</h1>
      <div class="connection" :class="{ active: connected }">
        {{ connected ? "DevTools connected" : "Standalone view" }}
      </div>
    </div>

    <div class="summary">
      <div class="metric">
        <strong>{{ data.variants.length }}</strong>
        <span>variants</span>
      </div>
      <div class="metric">
        <strong>{{ Object.keys(data.graph).length }}</strong>
        <span>graph nodes</span>
      </div>
      <div class="metric">
        <strong>{{ data.diagnostics.length }}</strong>
        <span>diagnostics</span>
      </div>
    </div>

    <div class="variant-list">
      <button
        v-for="variant in data.variants"
        :key="variant.name"
        class="variant-button"
        :class="{ active: variant.name === selected }"
        type="button"
        @click="emit('update:selected', variant.name)"
      >
        <span class="variant-name">
          <span>{{ variant.name }}</span>
          <span>{{ variant.extends.length }}</span>
        </span>
        <span class="variant-meta">{{ variant.configKeys.length }} config keys</span>
      </button>
    </div>
  </aside>
</template>
