<script setup lang="ts">
defineProps<{
  title: string;
  value: unknown;
}>();

function format(value: unknown) {
  return JSON.stringify(value, null, 2);
}
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <h2>{{ title }}</h2>
    </div>
    <div class="panel-body">
      <pre>{{ format(value) }}</pre>
    </div>
  </div>
</template>
