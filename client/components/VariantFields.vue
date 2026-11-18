<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";
import { getValueSources } from "~/utils/value-sources";
const props = defineProps<{
  variant: VariantEntry;
  entries: VariantEntry[];
  linkedField?: string;
}>();
const emit = defineEmits<{ selectSource: [variant: string] }>();
const overridesOnly = defineModel<boolean>("overridesOnly", { required: true });
const query = ref(props.linkedField ?? "");
const linkedField = ref(props.linkedField);
const tableBody = useTemplateRef("tableBody");
const toast = useToast();
const fieldLinkToastId = "variant-field-link";
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
  return rows.value.filter((row) => {
    if (overridesOnly.value && row.input !== "App config override") return false;
    if (linkedField.value !== undefined) return row.label === linkedField.value;
    return row.label.toLowerCase().includes(term);
  });
});
const visible = computed(() =>
  matches.value.slice(0, limit.value).map((row) => ({
    ...row,
    display: JSON.stringify(row.value) ?? "undefined",
  })),
);
const emptyMessage = computed(() => {
  if (!props.variant.active) return "This variant is disabled.";
  if (linkedField.value && !rows.value.some((row) => row.label === linkedField.value))
    return "The linked field is not present in this variant.";
  if (!rows.value.length) return "No configuration fields.";
  return overridesOnly.value ? "No matching fields with app overrides." : "No matching fields.";
});
watch(query, () => {
  linkedField.value = undefined;
});
watch([query, overridesOnly], () => {
  limit.value = pageSize;
});

onMounted(async () => {
  if (!linkedField.value) return;
  await nextTick();
  const row = tableBody.value?.querySelector<HTMLElement>("tr[data-linked-field]");
  row?.focus({ preventScroll: true });
  row?.scrollIntoView({ block: "nearest" });
});

async function copyFieldLink(field: string) {
  const url = new URL(window.location.href);
  // A shared link opens without the Nuxt dock's parent channel.
  if (url.searchParams.get("host") === "nuxt") url.searchParams.delete("host");
  url.searchParams.set("variant", props.variant.name);
  url.searchParams.set("field", field);
  url.hash = "variant-fields";
  try {
    await navigator.clipboard.writeText(url.href);
    toast.add({
      id: fieldLinkToastId,
      title: "Field link copied",
      icon: "i-lucide-copy-check",
      color: "primary",
    });
  } catch {
    toast.add({
      id: fieldLinkToastId,
      title: "Could not copy field link",
      icon: undefined,
      color: "error",
    });
  }
}
</script>
<template>
  <UCard
    id="variant-fields"
    as="section"
    aria-labelledby="variant-fields-heading"
    tabindex="-1"
    class="inspector-fields scroll-mt-4"
    :ui="{
      header:
        'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:px-4 @lg:grid-cols-[minmax(0,1fr)_15rem_auto]',
      body: 'p-0 sm:p-0',
    }"
  >
    <template #header>
      <h2
        id="variant-fields-heading"
        class="col-span-2 text-base font-semibold text-highlighted @lg:col-span-1"
      >
        Fields
      </h2>
      <UInput
        v-model="query"
        :disabled="rows.length === 0"
        aria-label="Find a field"
        placeholder="Find a field"
        type="search"
        icon="i-lucide-search"
        class="min-w-0"
      />
      <UButton
        :active="overridesOnly"
        :aria-pressed="overridesOnly"
        :disabled="rows.length === 0"
        type="button"
        color="neutral"
        variant="outline"
        active-color="primary"
        active-variant="soft"
        label="App overrides only"
        @click="overridesOnly = !overridesOnly"
      />
    </template>
    <div v-if="visible.length">
      <table class="fields-table">
        <caption class="sr-only">
          Resolved fields for
          {{ variant.name }}
        </caption>
        <thead class="bg-elevated/40">
          <tr>
            <th scope="col" class="w-[32%] text-start">Field</th>
            <th scope="col" class="text-start">Value</th>
            <th scope="col" class="w-[26%] text-start">Source</th>
          </tr>
        </thead>
        <tbody ref="tableBody">
          <tr
            v-for="row in visible"
            :key="row.label"
            :data-linked-field="row.label === linkedField ? '' : undefined"
            :tabindex="row.label === linkedField ? -1 : undefined"
            class="group"
          >
            <th scope="row" class="text-start font-mono text-highlighted">
              <div class="flex items-start gap-1">
                <span class="min-w-0">{{ row.label }}</span>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-link"
                  class="-my-0.5 shrink-0 p-1 text-muted lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                  :aria-label="`Copy link to ${row.label}`"
                  :title="`Copy link to ${row.label}`"
                  @click="copyFieldLink(row.label)"
                />
              </div>
            </th>
            <td class="field-value font-mono text-highlighted">
              <details v-if="row.display.length > 120">
                <summary class="cursor-pointer">{{ row.display.slice(0, 64) }}…</summary>
                <pre class="mt-1 whitespace-pre-wrap wrap-anywhere">{{ row.display }}</pre>
              </details>
              <span v-else>{{ row.display }}</span>
            </td>
            <td class="field-source text-toned">
              <template v-if="row.input && row.variant">
                <button
                  v-if="row.variant !== variant.name"
                  type="button"
                  class="cursor-pointer rounded-sm font-mono underline decoration-dotted underline-offset-4 hover:text-primary"
                  :aria-label="`Inspect source variant ${row.variant}`"
                  @click="emit('selectSource', row.variant)"
                >
                  {{ row.variant }}
                </button>
                <span v-else class="font-mono">{{ row.variant }}</span>
                <span class="text-dimmed"> · </span>
                <span
                  class="inline-block text-xs"
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
    <p v-else class="px-3 py-4 text-sm text-muted sm:px-4" role="status">
      {{ emptyMessage }}
    </p>
    <UButton
      v-if="matches.length > limit"
      class="m-3 sm:m-4"
      color="neutral"
      variant="subtle"
      @click="limit += pageSize"
    >
      Show {{ Math.min(pageSize, matches.length - limit) }} more fields
    </UButton>
  </UCard>
</template>
