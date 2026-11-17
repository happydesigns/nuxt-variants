<script setup lang="ts">
import type { VariantDiagnostic } from "~/types/devtools";

defineProps<{
  diagnostics: readonly VariantDiagnostic[];
}>();
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }" class="issues-panel">
    <div class="panel-head">
      <h2>Validation Issues</h2>
      <p>Registry problems detected during Nuxt prepare.</p>
    </div>
    <div class="panel-body">
      <div class="flex flex-col gap2">
        <UAlert
          v-for="diagnostic in diagnostics"
          :key="diagnostic.message"
          color="warning"
          variant="soft"
          :title="diagnostic.code"
          :description="diagnostic.message"
        />
      </div>
    </div>
  </UCard>
</template>
