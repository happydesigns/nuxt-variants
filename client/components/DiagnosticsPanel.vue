<script setup lang="ts">
import type { VariantDiagnostic } from "~/types/devtools";

defineProps<{
  diagnostics: readonly VariantDiagnostic[];
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
          <strong>{{ diagnostic.code }}</strong>
          <span>{{ diagnostic.message }}</span>
        </NTip>
      </div>
    </div>
  </NCard>
</template>
