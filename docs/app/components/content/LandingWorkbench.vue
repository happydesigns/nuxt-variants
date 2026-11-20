<script setup lang="ts">
import { createVariantResolver } from "../../../../src/portable/core";

const resolver = createVariantResolver({
  csv: { config: { delimiter: "," } },
  summary: { extends: "csv", config: { columns: ["id", "total"] } },
  audit: { extends: "summary", config: { columns: ["id", "total", "author"] } },
});

type ExportVariant = "summary" | "audit";
const choices: { label: string; value: ExportVariant }[] = [
  { label: "Summary", value: "summary" },
  { label: "Audit", value: "audit" },
];
const selected = ref<ExportVariant>("audit");
const useSemicolon = ref(false);
const result = computed(() =>
  useSemicolon.value
    ? resolver.resolve(selected.value, { csv: { config: { delimiter: ";" } } })
    : resolver.resolve(selected.value),
);
</script>

<template>
  <UCard class="min-w-0 text-start">
    <template #header>
      <h2 class="text-base font-semibold text-highlighted">Data export</h2>
    </template>

    <div class="space-y-4">
      <URadioGroup v-model="selected" legend="Variant" orientation="horizontal" :items="choices" />
      <USwitch v-model="useSemicolon" label="Use semicolons" />
      <div aria-live="polite" aria-atomic="true" class="min-w-0 space-y-2">
        <p class="font-mono text-sm text-muted">{{ result.features.join(" → ") }}</p>
        <pre
          class="overflow-x-auto rounded-md bg-muted p-3 text-sm text-default"
        ><code>{{ JSON.stringify(result.config, null, 2) }}</code></pre>
      </div>
    </div>
  </UCard>
</template>
