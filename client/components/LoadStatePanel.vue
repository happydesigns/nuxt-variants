<script setup lang="ts">
defineProps<{
  error?: string;
  pending: boolean;
}>();
</script>

<template>
  <div v-if="pending" class="panel">
    <div class="panel-body">
      <p class="empty">Loading variants...</p>
    </div>
  </div>

  <div v-else-if="error" class="panel">
    <div class="panel-body">
      <p class="diagnostic">{{ error }}</p>
    </div>
  </div>
</template>
