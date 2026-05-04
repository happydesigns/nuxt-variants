<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

defineProps<{
  selected?: string;
  variants: VariantEntry[];
}>();

const emit = defineEmits<{
  "update:selected": [value: string];
}>();
</script>

<template>
  <div class="toolbar">
    <select
      class="select"
      :value="selected"
      aria-label="Variant"
      @change="emit('update:selected', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="variant in variants" :key="variant.name" :value="variant.name">
        {{ variant.name }}
      </option>
    </select>
  </div>
</template>
