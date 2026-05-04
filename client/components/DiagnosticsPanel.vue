<script setup lang="ts">
import type { VariantDiagnostic } from "~/types/devtools";

defineProps<{
  diagnostics: VariantDiagnostic[];
}>();
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Diagnostics</h2>
    </div>
    <div class="panel-body">
      <p v-if="!diagnostics.length" class="empty">No diagnostics.</p>
      <div v-for="diagnostic in diagnostics" :key="diagnostic.message" class="diagnostic">
        {{ diagnostic.message }}
      </div>
    </div>
  </section>
</template>
