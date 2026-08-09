<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{
  variant?: VariantEntry;
}>();

const resolutionOrder = computed(() => props.variant?.activeFeatures ?? []);
</script>

<template>
  <NCard>
    <div class="composition-panel">
      <div class="composition-head">
        <h2>Resolution order</h2>
        <p>Inherited features merge from left to right. The selected variant is applied last.</p>
      </div>

      <div class="composition-row">
        <span class="composition-label">Features</span>
        <div class="flex flex-wrap gap2">
          <template v-for="(feature, index) in resolutionOrder" :key="feature">
            <span v-if="index" class="resolution-arrow" aria-hidden="true">→</span>
            <NBadge :n="feature === variant?.name ? 'green' : 'gray'">
              {{ feature }}
            </NBadge>
          </template>
          <span v-if="!resolutionOrder.length" class="muted">Disabled</span>
        </div>
      </div>

      <div class="composition-row">
        <span class="composition-label">Direct parents</span>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="parent in variant?.extends ?? []" :key="parent" n="gray">
            {{ parent }}
          </NBadge>
          <span v-if="!variant?.extends.length" class="muted">None</span>
        </div>
      </div>
    </div>
  </NCard>
</template>
