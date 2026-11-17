<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";
import { getValueSources } from "~/utils/value-sources";

const props = defineProps<{ variant: VariantEntry; entries: VariantEntry[] }>();
const expanded = ref(false);
const selection = ref<string>();
const fields = computed(() =>
  getValueSources(props.variant, props.entries).map((source) => ({
    ...source,
    value: JSON.stringify(source.path),
    label: source.path
      .map((key, i) =>
        /^[A-Za-z_$][\w$]*$/.test(key)
          ? i === 0
            ? key
            : "." + key
          : "[" + JSON.stringify(key) + "]",
      )
      .join(""),
    displayValue: JSON.stringify(source.value),
  })),
);
const field = computed(
  () => fields.value.find((item) => item.value === selection.value) ?? fields.value[0],
);
function toggle(event: Event) {
  expanded.value = (event.currentTarget as HTMLDetailsElement).open;
}
</script>

<template>
  <details class="mb-4" @toggle="toggle">
    <summary class="cursor-pointer font-medium">Value source</summary>
    <div v-if="expanded" class="mt-3">
      <template v-if="field">
        <label class="block text-sm" for="variant-config-field">Config field</label>
        <USelect
          id="variant-config-field"
          class="my-2 w-full"
          :items="fields"
          :model-value="field.value"
          @update:model-value="selection = $event"
        />
        <p aria-live="polite" class="text-sm wrap-anywhere">
          <code>{{ field.displayValue }}</code> · {{ field.input }} ·
          <strong>{{ field.variant }}</strong>
        </p>
      </template>
      <p v-else class="muted">No scalar or array values in this config.</p>
    </div>
  </details>
</template>
