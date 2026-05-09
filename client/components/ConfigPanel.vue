<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  value: unknown;
}>();

const code = computed(() => JSON.stringify(props.value, null, 2));
</script>

<template>
  <NCard>
    <div class="panel-head">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <div class="panel-body">
      <JsonCodeBlock :code="code" />
    </div>
  </NCard>
</template>
