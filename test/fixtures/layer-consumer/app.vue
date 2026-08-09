<script setup lang="ts">
const { config, features } = useVariant("article");
const variants = useVariants();
</script>

<template>
  <div id="config">{{ JSON.stringify(config) }}</div>
  <div id="features">{{ JSON.stringify([...features]) }}</div>
  <div id="variants">{{ JSON.stringify(variants) }}</div>
</template>
