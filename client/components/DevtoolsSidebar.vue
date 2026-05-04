<script setup lang="ts">
import type { DevtoolsData, VariantEntry } from "~/types/devtools";

defineProps<{
  data: DevtoolsData;
  selected?: string;
}>();

const emit = defineEmits<{
  "update:selected": [value: string];
}>();

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function variantMeta(variant: VariantEntry) {
  const keyText = `${variant.configKeys.length} ${plural(variant.configKeys.length, "key")}`;

  if (variant.extends.length === 0) {
    return `${keyText} / base`;
  }

  return `${keyText} / extends ${variant.extends.length}`;
}
</script>

<template>
  <aside class="sidebar n-bg-base">
    <div class="sidebar-head">
      <h2>Nuxt Variants</h2>
      <p>{{ data.variants.length }} variant definitions</p>
    </div>

    <div class="sidebar-health" :class="{ 'has-issues': data.diagnostics.length > 0 }">
      <span>{{ data.diagnostics.length ? "Needs attention" : "Registry is valid" }}</span>
      <NBadge :n="data.diagnostics.length ? 'orange' : 'green'">
        {{
          data.diagnostics.length
            ? `${data.diagnostics.length} ${plural(data.diagnostics.length, "issue")}`
            : "No issues"
        }}
      </NBadge>
    </div>

    <nav class="variant-list" aria-label="Variants">
      <button
        v-for="variant in data.variants"
        :key="variant.name"
        class="variant-nav"
        :class="{ 'is-active': variant.name === selected }"
        type="button"
        :aria-current="variant.name === selected ? 'page' : undefined"
        @click="emit('update:selected', variant.name)"
      >
        <span class="variant-name">{{ variant.name }}</span>
        <span class="variant-meta">{{ variantMeta(variant) }}</span>
      </button>
    </nav>
  </aside>
</template>
