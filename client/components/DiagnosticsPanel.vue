<script setup lang="ts">
import type { VariantDiagnostic } from "~/types/devtools";

defineProps<{
  diagnostics: VariantDiagnostic[];
}>();
</script>

<template>
  <NCard>
    <div class="border-b n-border-base p4">
      <NIconTitle icon="i-carbon-warning-alt" text="Diagnostics" text-lg />
      <p mt1 text-sm op50>Build-time validation for the variant graph.</p>
    </div>
    <div class="p4">
      <NTip v-if="!diagnostics.length" icon="i-carbon-checkmark-outline" n="green">
        No diagnostics.
      </NTip>
      <div v-else class="flex flex-col gap2">
        <NTip v-for="diagnostic in diagnostics" :key="diagnostic.message" icon="i-carbon-warning">
          {{ diagnostic.message }}
        </NTip>
      </div>
    </div>
  </NCard>
</template>
