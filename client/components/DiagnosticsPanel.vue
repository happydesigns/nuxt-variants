<script setup lang="ts">
import type { VariantDiagnostic } from "~/types/devtools";
defineProps<{ diagnostics: readonly VariantDiagnostic[] }>();
</script>
<template>
  <div class="flex flex-col gap-2" aria-label="Registry diagnostics">
    <UAlert
      v-for="diagnostic in diagnostics"
      :key="diagnostic.message"
      :color="diagnostic.severity === 'error' ? 'error' : 'warning'"
      variant="subtle"
      :title="diagnostic.code"
      :description="diagnostic.message"
    />
  </div>
</template>
