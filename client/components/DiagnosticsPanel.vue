<script setup lang="ts">
import type { VariantDiagnostic } from "~/types/devtools";

defineProps<{
  diagnostics: VariantDiagnostic[];
}>();
</script>

<template>
  <NCard class="issues-panel">
    <div class="panel-head">
      <h2>Validation Issues</h2>
      <p>Registry problems detected during Nuxt prepare.</p>
    </div>
    <div class="panel-body">
      <div class="flex flex-col gap2">
        <NTip v-for="diagnostic in diagnostics" :key="diagnostic.message" icon="i-carbon-warning">
          {{ diagnostic.message }}
        </NTip>
      </div>
    </div>
  </NCard>
</template>
