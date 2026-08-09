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
  <NCard v-if="pending" class="p4">
    <div class="flex items-center gap3 op70">
      <NLoading />
      <span>Loading variants...</span>
    </div>
  </NCard>

  <NCard v-else-if="error" class="load-error">
    <div>
      <strong>Could not load registry data</strong>
      <p>{{ error }}</p>
    </div>
    <NButton border icon="i-carbon-renew" @click="emit('retry')">Retry</NButton>
  </NCard>
</template>
