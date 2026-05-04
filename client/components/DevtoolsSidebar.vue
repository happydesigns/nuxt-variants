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
    <div class="p4 border-b n-border-base">
      <NIconTitle icon="i-carbon-branch" text="Nuxt Variants" text-lg font-700 />
      <div mt2>
        <NBadge :n="connected ? 'green' : 'gray'">
          {{ connected ? "DevTools connected" : "Standalone view" }}
        </NBadge>
      </div>
    </div>

    <div class="grid grid-cols-3 gap2 p3 border-b n-border-base">
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

    <div class="flex flex-col gap1 p2">
      <NButton
        v-for="variant in data.variants"
        :key="variant.name"
        :n="variant.name === selected ? 'green' : 'gray'"
        class="variant-nav"
        type="button"
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
    </div>
  </aside>
</template>
