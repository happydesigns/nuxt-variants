<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";
import { filterVariants } from "~/utils/filter-variants";
const props = defineProps<{ entries: VariantEntry[]; routeVariant?: string }>();
const selected = defineModel<string>("selected");
const open = ref(false);
const query = ref("");
const filtered = computed(() => filterVariants(props.entries, query.value));
function select(name: string) {
  selected.value = name;
  open.value = false;
}
</script>
<template>
  <UDashboardSidebar
    id="registry"
    v-model:open="open"
    :default-size="15"
    :menu="{ title: 'Variants' }"
    :ui="{ root: 'bg-elevated/30', header: 'border-b border-default', body: 'gap-3 py-3 px-3' }"
  >
    <template #header>
      <UIcon name="i-lucide-git-branch" class="size-5 text-primary" />
      <h2 class="min-w-0 truncate text-sm font-semibold text-highlighted">Variants</h2>
      <UBadge color="neutral" variant="subtle" size="sm">{{ entries.length }}</UBadge>
    </template>
    <UInput
      v-model="query"
      type="search"
      aria-label="Filter variants"
      placeholder="Filter variants"
      icon="i-lucide-search"
      class="w-full"
    />
    <nav aria-label="Variants" class="flex flex-col gap-0.5">
      <UButton
        v-for="entry in filtered"
        :key="entry.name"
        color="neutral"
        variant="ghost"
        active-variant="soft"
        :active="entry.name === selected"
        :aria-current="entry.name === selected ? 'true' : undefined"
        :title="entry.name"
        class="group justify-start"
        @click="select(entry.name)"
      >
        <span class="min-w-0 truncate font-mono group-aria-[current=true]:text-primary">
          {{ entry.name }}
        </span>
        <span v-if="entry.name === routeVariant" class="ms-auto text-xs">Current route</span>
        <span v-else-if="!entry.active" class="ms-auto text-xs text-muted">Disabled</span>
      </UButton>
      <p v-if="query && !filtered.length" class="px-2 py-1 text-sm text-muted" role="status">
        No matching variants.
      </p>
    </nav>
  </UDashboardSidebar>
</template>
