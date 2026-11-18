<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{ variant: VariantEntry }>();
const registrySources = computed(() =>
  props.variant.sources.some((source) => source.kind === "layer") ? props.variant.sources : [],
);
</script>

<template>
  <section aria-labelledby="variant-json" class="min-w-0 space-y-3">
    <h2
      id="variant-json"
      tabindex="-1"
      class="w-fit scroll-mt-4 rounded-sm px-3 text-base font-semibold text-highlighted focus-visible:outline-2 focus-visible:outline-primary sm:px-4"
    >
      Configuration
    </h2>
    <dl
      v-if="registrySources.length"
      class="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 sm:px-4"
    >
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
    <ProseCodeGroup
      aria-label="Configuration views"
      :ui="{ root: 'm-0 min-w-0', triggerIcon: 'hidden' }"
    >
      <LazyConfigPanel filename="Effective configuration" :value="variant.resolvedConfig" />
      <LazyConfigPanel
        filename="Variant inputs"
        :value="{ base: variant.base, app: variant.app }"
      />
    </ProseCodeGroup>
  </section>
</template>
