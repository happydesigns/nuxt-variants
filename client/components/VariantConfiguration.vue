<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{ variant: VariantEntry }>();
const registrySources = computed(() =>
  props.variant.sources.some((source) => source.kind === "layer") ? props.variant.sources : [],
);
</script>

<template>
  <UCard
    id="variant-json"
    as="section"
    aria-labelledby="variant-json-heading"
    tabindex="-1"
    class="@container min-w-0 scroll-mt-4"
    :ui="{ header: 'px-3 py-2.5 sm:px-4', body: 'space-y-3 px-3 py-3 sm:px-4 sm:py-3' }"
  >
    <template #header>
      <h2 id="variant-json-heading" class="text-base font-semibold text-highlighted">
        Configuration
      </h2>
    </template>
    <dl v-if="registrySources.length" class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <dt class="text-sm text-muted">Registry sources</dt>
      <dd>
        <ul role="list" class="flex flex-wrap gap-1.5">
          <li
            v-for="source in registrySources"
            :key="source.kind + ':' + source.name"
            class="max-w-full"
          >
            <UBadge color="neutral" variant="subtle" class="wrap-anywhere">
              {{ source.kind === "application" ? "App registry" : source.name }}
            </UBadge>
          </li>
        </ul>
      </dd>
    </dl>
    <div class="grid min-w-0 gap-4 @3xl:grid-cols-2">
      <LazyConfigPanel title="Effective configuration" :value="variant.resolvedConfig" />
      <LazyConfigPanel title="Variant inputs" :value="{ base: variant.base, app: variant.app }" />
    </div>
  </UCard>
</template>
