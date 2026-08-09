<script setup lang="ts">
import type { DevtoolsData, VariantEntry } from "~/types/devtools";
import { filterVariants } from "~/utils/filter-variants";

const props = defineProps<{
  data: DevtoolsData;
  routeVariant?: string;
  selected?: string;
}>();

const emit = defineEmits<{
  "update:selected": [value: string];
}>();

const query = ref("");
const filteredVariants = computed(() => filterVariants(props.data.variants, query.value));

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

function selectVariant(event: Event) {
  const target = event.target;

  if (target instanceof HTMLSelectElement) {
    emit("update:selected", target.value);
  }
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

    <div class="mobile-variant-picker">
      <label for="variant-picker">Variant</label>
      <select id="variant-picker" :value="selected" @change="selectVariant">
        <option v-for="variant in data.variants" :key="variant.name" :value="variant.name">
          {{ variant.name }}{{ variant.name === routeVariant ? " (current route)" : "" }}
        </option>
      </select>
    </div>

    <div class="sidebar-search">
      <NTextInput v-model="query" icon="i-carbon-search" placeholder="Filter variants" />
      <span class="search-count">{{ filteredVariants.length }} of {{ data.variants.length }}</span>
    </div>

    <nav class="variant-list" aria-label="Variants">
      <button
        v-for="variant in filteredVariants"
        :key="variant.name"
        class="variant-nav"
        :class="{ 'is-active': variant.name === selected }"
        type="button"
        :aria-current="variant.name === selected ? 'page' : undefined"
        @click="emit('update:selected', variant.name)"
      >
        <span class="variant-heading">
          <span class="variant-name">{{ variant.name }}</span>
          <span v-if="variant.name === routeVariant" class="route-label">current route</span>
        </span>
        <span class="variant-row-meta">
          <span class="variant-meta">{{ variantMeta(variant) }}</span>
          <span v-if="!variant.active" class="inactive-label">disabled</span>
        </span>
      </button>
      <p v-if="!filteredVariants.length" class="empty-state">No variants match “{{ query }}”.</p>
    </nav>
  </aside>
</template>
