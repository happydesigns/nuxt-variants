<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

defineProps<{
  variant?: VariantEntry;
}>();
</script>

<template>
  <NCard>
    <div class="overview-grid">
      <div>
        <NIconTitle icon="i-carbon-tree-view" text="Extends" text-sm font-700 op70 mb3 />
        <div class="flex flex-wrap gap2">
          <NBadge v-for="parent in variant?.extends ?? []" :key="parent" n="gray">
            {{ parent }}
          </NBadge>
          <span v-if="!variant?.extends.length" text-sm op50>None</span>
        </div>
      </div>

      <div>
        <NIconTitle
          icon="i-carbon-checkmark-outline"
          text="Active Features"
          text-sm
          font-700
          op70
          mb3
        />
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
