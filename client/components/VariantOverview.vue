<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{
  variant?: VariantEntry;
}>();

const extendedVariants = computed(() => props.variant?.extends ?? []);
</script>

<template>
  <NCard>
    <div class="composition-panel">
      <div class="composition-head">
        <h2>Composition</h2>
        <p>Variants listed in extends merge first. The selected variant is applied last.</p>
      </div>

      <div class="composition-row">
        <span class="composition-label">Extends</span>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="extendedVariant in extendedVariants" :key="extendedVariant" n="gray">
            {{ extendedVariant }}
          </NBadge>
          <span v-if="!extendedVariants.length" class="muted">None</span>
        </div>
      </div>

      <div class="composition-row">
        <span class="composition-label">Selected</span>
        <div class="flex flex-wrap gap2">
          <NBadge v-if="variant" n="green">
            {{ variant.name }}
          </NBadge>
          <span v-else class="muted">None</span>
        </div>
      </div>
    </div>
  </NCard>
</template>
