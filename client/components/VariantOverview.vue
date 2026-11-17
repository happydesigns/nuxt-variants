<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{
  variant?: VariantEntry;
}>();

const resolutionOrder = computed(() => props.variant?.activeFeatures ?? []);
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <div class="composition-panel">
      <div class="composition-head">
        <h2>Resolution order</h2>
        <p>
          Active inheritance traversal. Later parents take priority with their complete config; the
          selected variant wins last.
        </p>
      </div>

      <div class="composition-row">
        <span class="composition-label">Features</span>
        <div class="flex flex-wrap gap2">
          <template v-for="(feature, index) in resolutionOrder" :key="feature">
            <span v-if="index" class="resolution-arrow" aria-hidden="true">→</span>
            <UBadge :color="feature === variant?.name ? 'success' : 'neutral'">
              {{ feature }}
            </UBadge>
          </template>
          <span v-if="!resolutionOrder.length" class="muted">Disabled</span>
        </div>
      </div>

      <div class="composition-row">
        <span class="composition-label">Direct parents</span>
        <div class="flex flex-wrap gap2">
          <UBadge
            v-for="parent in variant?.extends ?? []"
            :key="parent"
            color="neutral"
            variant="soft"
          >
            {{ parent }}
          </UBadge>
          <span v-if="!variant?.extends.length" class="muted">None</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
