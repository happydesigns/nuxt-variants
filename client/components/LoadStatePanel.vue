<script setup lang="ts">
defineProps<{ error?: string; pending: boolean }>();
defineEmits<{ retry: [] }>();
</script>
<template>
  <UAlert
    v-if="error"
    role="alert"
    color="error"
    variant="subtle"
    title="Could not load registry"
    :description="error"
  >
    <template #actions
      ><UButton color="neutral" variant="outline" label="Retry" @click="$emit('retry')"
    /></template>
  </UAlert>
  <p v-else-if="pending" class="flex items-center gap-2 text-sm text-muted" role="status">
    <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" aria-hidden="true" />
    Loading registry…
  </p>
</template>
