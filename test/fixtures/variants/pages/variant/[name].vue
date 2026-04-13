<script setup lang="ts">
const route = useRoute();
const name = route.params.name as string;
const { config, has } = useVariant(name);
const hasSeo = has("seo");
const hasHero = has("hero");
</script>

<template>
  <div>
    <div id="config">{{ JSON.stringify(config) }}</div>
    <div id="has-seo">{{ hasSeo }}</div>
    <div id="has-hero">{{ hasHero }}</div>
  </div>
</template>
