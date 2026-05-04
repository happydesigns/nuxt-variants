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
  <NNavbar no-padding class="rounded n-border-base border">
    <template #search>
      <NSelect
        icon="i-carbon-list-boxes"
        :model-value="selected"
        class="min-w-64"
        @update:model-value="emit('update:selected', $event)"
      >
        <option v-for="variant in variants" :key="variant.name" :value="variant.name">
          {{ variant.name }}
        </option>
      </NSelect>
    </template>
  </NNavbar>
</template>
