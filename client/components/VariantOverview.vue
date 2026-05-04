<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{
  variant?: VariantEntry;
}>();

const parents = computed(() => props.variant?.extends ?? []);
</script>

<template>
  <NCard>
    <div class="composition-panel">
      <div class="composition-head">
        <h2>Composition</h2>
        <p>Parent variants merge first. The selected variant is applied last.</p>
      </div>

      <div class="composition-row">
        <span class="composition-label">Parents</span>
        <div class="flex flex-wrap gap2">
          <NBadge v-for="parent in parents" :key="parent" n="gray">
            {{ parent }}
          </NBadge>
          <span v-if="!parents.length" class="muted">None</span>
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
