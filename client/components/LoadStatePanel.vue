<script setup lang="ts">
defineProps<{
  error?: string;
  pending: boolean;
}>();
</script>

<template>
  <NCard v-if="pending" class="p4">
    <div class="flex items-center gap3 op70">
      <NLoading />
      <span>Loading variants...</span>
    </div>
  </NCard>

  <NTip v-else-if="error" icon="i-carbon-warning">
    {{ error }}
  </NTip>
</template>
