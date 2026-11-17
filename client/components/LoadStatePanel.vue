<script setup lang="ts">
defineProps<{
  error?: string;
  pending: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }" v-if="pending" class="p4">
    <div class="flex items-center gap3 op70">
      <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" aria-hidden="true" />
      <span>Loading variants...</span>
    </div>
  </UCard>

  <UCard :ui="{ body: 'p-0 sm:p-0' }" v-else-if="error" class="load-error">
    <div>
      <strong>Could not load registry data</strong>
      <p>{{ error }}</p>
    </div>
    <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" @click="emit('retry')"
      >Retry</UButton
    >
  </UCard>
</template>
