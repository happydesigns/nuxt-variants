<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";
import { getValueSources } from "~/utils/value-sources";
const props = defineProps<{ variant: VariantEntry; entries: VariantEntry[] }>();
const query = ref("");
const pageSize = 40;
const limit = ref(pageSize);
const rows = computed(() =>
  getValueSources(props.variant, props.entries).map((source) => {
    const label = source.path
      .map((key, index) => {
        if (!/^[A-Za-z_$][\w$]*$/.test(key)) return "[" + JSON.stringify(key) + "]";
        return index ? "." + key : key;
      })
      .join("");
    return { ...source, label };
  }),
);
const matches = computed(() => {
  const term = query.value.trim().toLowerCase();
  return term ? rows.value.filter((row) => row.label.toLowerCase().includes(term)) : rows.value;
});
const visible = computed(() =>
  matches.value.slice(0, limit.value).map((row) => ({
    ...row,
    display: JSON.stringify(row.value) ?? "undefined",
  })),
);
watch(query, () => {
  limit.value = pageSize;
});
</script>
<template>
  <section aria-labelledby="variant-fields" class="inspector-fields flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 id="variant-fields" class="text-base font-semibold text-highlighted">Fields</h2>
      <UInput
        v-model="query"
        :disabled="rows.length === 0"
        aria-label="Find a field"
        placeholder="Find a field"
        type="search"
        icon="i-lucide-search"
        class="min-w-0 max-w-full sm:w-60"
      />
    </div>
    <div v-if="visible.length" class="overflow-hidden rounded-lg border border-default">
      <table class="fields-table">
        <caption class="sr-only">
          Resolved fields for
          {{ variant.name }}
        </caption>
        <thead>
          <tr>
            <th scope="col" class="w-[32%] text-start">Field</th>
            <th scope="col" class="text-start">Value</th>
            <th scope="col" class="w-[26%] text-start">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visible" :key="row.label">
            <th scope="row" class="text-start font-mono text-highlighted">{{ row.label }}</th>
            <td class="font-mono text-default">
              <details v-if="row.display.length > 120">
                <summary class="cursor-pointer text-muted">{{ row.display.slice(0, 64) }}…</summary>
                <pre class="mt-1 whitespace-pre-wrap wrap-anywhere">{{ row.display }}</pre>
              </details>
              <span v-else>{{ row.display }}</span>
            </td>
            <td>
              <template v-if="row.input">
                <span class="font-mono">{{ row.variant }}</span>
                <span class="text-dimmed"> · </span>
                <span
                  class="text-xs"
                  :class="row.input === 'App config override' ? 'text-primary' : 'text-muted'"
                  >{{ row.input }}</span
                >
              </template>
              <span v-else class="text-xs text-muted">No single source</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-sm text-muted" role="status">
      {{
        rows.length
          ? "No matching fields."
          : variant.active
            ? "No configuration fields."
            : "This variant is disabled."
      }}
    </p>
    <UButton
      v-if="matches.length > limit"
      class="self-start"
      color="neutral"
      variant="subtle"
      @click="limit += pageSize"
    >
      Show {{ Math.min(pageSize, matches.length - limit) }} more fields
    </UButton>
  </section>
</template>
