<script setup lang="ts">
const props = defineProps<{
  icon: string;
  title: string;
  value: unknown;
}>();

const code = computed(() => JSON.stringify(props.value, null, 2));
</script>

<template>
  <NCard>
    <div class="border-b n-border-base p4">
      <NIconTitle :icon="icon" :text="title" text-lg />
    </div>
    <div class="p4">
      <NCodeBlock :code="code" lang="json" />
    </div>
  </NCard>
</template>
