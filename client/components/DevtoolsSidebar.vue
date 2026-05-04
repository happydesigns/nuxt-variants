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
  <aside class="sidebar n-bg-base">
    <div class="sidebar-head">
      <NIconTitle icon="i-carbon-branch" text="Nuxt Variants" text-lg font-700 />
      <div mt2>
        <NBadge :n="connected ? 'green' : 'gray'">
          {{ connected ? "DevTools connected" : "Standalone view" }}
        </NBadge>
      </div>
    </div>

    <div class="metrics">
      <NCard
        v-for="metric in [
          { label: 'variants', value: data.variants.length },
          { label: 'graph nodes', value: Object.keys(data.graph).length },
          { label: 'diagnostics', value: data.diagnostics.length },
        ]"
        :key="metric.label"
        class="px3 py2"
      >
        <div text-lg font-700>
          {{ metric.value }}
        </div>
        <div text-xs op60>
          {{ metric.label }}
        </div>
      </NCard>
    </div>

    <nav class="variant-list" aria-label="Variants">
      <NButton
        v-for="variant in data.variants"
        :key="variant.name"
        :n="variant.name === selected ? 'green' : 'gray'"
        class="variant-nav"
        type="button"
        :aria-current="variant.name === selected ? 'page' : undefined"
        @click="emit('update:selected', variant.name)"
      >
        <span class="min-w-0 flex flex-col items-start">
          <span class="w-full flex items-center justify-between gap3 font-700">
            <span truncate>{{ variant.name }}</span>
            <NBadge n="gray">
              {{ variant.extends.length }}
            </NBadge>
          </span>
          <span text-xs op60>{{ variant.configKeys.length }} config keys</span>
        </span>
      </NButton>
    </nav>
  </aside>
</template>
