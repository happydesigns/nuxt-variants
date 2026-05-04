<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

defineProps<{
  variant?: VariantEntry;
}>();
</script>

<template>
  <NCard>
    <div class="overview-grid">
      <div class="overview-section">
        <h2>Inheritance</h2>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="parent in variant?.extends ?? []" :key="parent" n="gray">
            {{ parent }}
          </NBadge>
          <span v-if="!variant?.extends.length" class="muted">No parent variants</span>
        </div>
      </div>

      <div class="overview-section">
        <h2>Active Features</h2>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="feature in variant?.activeFeatures ?? []" :key="feature" n="green">
            {{ feature }}
          </NBadge>
          <span v-if="!variant?.activeFeatures.length" class="muted">No active features</span>
        </div>
      </div>
    </div>
  </NCard>
</template>
