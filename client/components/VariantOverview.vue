<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

defineProps<{
  variant?: VariantEntry;
}>();
</script>

<template>
  <NCard>
    <div class="border-b n-border-base p4">
      <NIconTitle icon="i-carbon-network-3" :text="variant?.name ?? 'Variant'" text-xl />
      <p mt1 text-sm op50>Inheritance and active feature resolution for the selected variant.</p>
    </div>
    <div class="grid gap4 p4 md:grid-cols-2">
      <div>
        <div text-sm font-700 op70 mb2>Extends</div>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="parent in variant?.extends ?? []" :key="parent" n="gray">
            {{ parent }}
          </NBadge>
          <span v-if="!variant?.extends.length" text-sm op50>None</span>
        </div>
      </div>

      <div>
        <div text-sm font-700 op70 mb2>Active Features</div>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="feature in variant?.activeFeatures ?? []" :key="feature" n="green">
            {{ feature }}
          </NBadge>
          <span v-if="!variant?.activeFeatures.length" text-sm op50>None</span>
        </div>
      </div>
    </div>
  </NCard>
</template>
