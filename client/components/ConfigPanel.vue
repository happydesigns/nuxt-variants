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
    <div class="panel-head">
      <NIconTitle :icon="icon" :text="title" text-lg />
    </div>
    <div class="panel-body">
      <NCodeBlock :code="code" lang="json" />
    </div>
  </NCard>
</template>
