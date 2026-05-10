<script setup lang="ts">
defineProps<{
  icon: string;
  number: string;
  title: string;
}>();
</script>

<template>
  <UPageFeature
    :icon="icon"
    orientation="horizontal"
    :ui="{
      root: 'rounded-xl border border-default bg-default p-4',
      leading: 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary',
      leadingIcon: 'size-5',
      title: 'font-semibold text-highlighted',
      description: 'text-sm leading-6 text-muted [&_p]:m-0',
    }"
  >
    <template #title>
      <span class="mr-2 text-xs font-medium text-muted">{{ number }}</span>
      {{ title }}
    </template>

    <template #description>
      <slot />
    </template>
  </UPageFeature>
</template>
