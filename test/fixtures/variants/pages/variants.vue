<script setup lang="ts">
const variants = useVariants();
const runtimeConfig = useRuntimeConfig();
const publicConfig = runtimeConfig.public as Record<string, unknown>;
const leaksRegistry = "variantRegistry" in publicConfig || "variantsConfigKey" in publicConfig;
</script>

<template>
  <div id="variants">{{ JSON.stringify(variants) }}</div>
  <div id="runtime-config-leak">{{ JSON.stringify(leaksRegistry) }}</div>
</template>
