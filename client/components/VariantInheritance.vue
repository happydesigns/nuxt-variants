<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

const props = defineProps<{ variant: VariantEntry; entries: VariantEntry[] }>();
const emit = defineEmits<{ select: [name: string] }>();
const names = computed(() => new Set(props.entries.map((entry) => entry.name)));
const directParents = computed(() => new Set(props.variant.extends));
const distinguishesAncestors = computed(() =>
  props.variant.activeFeatures.some(
    (name) => name !== props.variant.name && !directParents.value.has(name),
  ),
);
const unappliedParents = computed(() => {
  const applied = new Set(props.variant.activeFeatures);
  return [...directParents.value].filter((name) => !applied.has(name));
});
</script>

<template>
  <UCard
    id="variant-composition"
    as="section"
    aria-labelledby="variant-composition-heading"
    tabindex="-1"
    variant="subtle"
    class="scroll-mt-4"
    :ui="{ header: 'px-3 py-2.5 sm:px-4', body: 'space-y-3 px-3 py-3 sm:px-4 sm:py-3' }"
  >
    <template #header>
      <h2 id="variant-composition-heading" class="text-base font-semibold text-highlighted">
        Inheritance
      </h2>
    </template>

    <div v-if="variant.activeFeatures.length > 1">
      <h3 id="resolution-order" class="mb-2 text-sm text-muted">Resolution order</h3>
      <ol aria-labelledby="resolution-order" role="list" class="flex flex-wrap gap-x-3 gap-y-2">
        <li
          v-for="(name, index) in variant.activeFeatures"
          :key="name"
          class="inline-flex max-w-full items-center gap-1.5"
        >
          <span aria-hidden="true" class="shrink-0 font-mono text-xs tabular-nums text-muted">
            {{ index + 1 }}.
          </span>
          <UBadge
            v-if="name === variant.name"
            variant="soft"
            aria-current="true"
            class="min-w-0 font-mono wrap-anywhere"
          >
            {{ name }}
          </UBadge>
          <UButton
            v-else
            :disabled="!names.has(name)"
            color="neutral"
            variant="subtle"
            size="sm"
            class="min-w-0 flex-wrap font-mono wrap-anywhere"
            @click="emit('select', name)"
          >
            {{ name }}
            <span v-if="distinguishesAncestors" class="font-sans text-xs text-muted">
              {{ directParents.has(name) ? "Direct" : "Indirect" }}
            </span>
          </UButton>
        </li>
      </ol>
    </div>

    <div v-if="unappliedParents.length">
      <h3 id="unapplied-parents" class="mb-2 text-sm text-muted">Parents not applied</h3>
      <ul aria-labelledby="unapplied-parents" role="list" class="flex flex-wrap gap-2">
        <li v-for="name in unappliedParents" :key="name" class="max-w-full">
          <UButton
            :label="name"
            :disabled="!names.has(name)"
            color="neutral"
            variant="outline"
            size="sm"
            class="max-w-full font-mono wrap-anywhere"
            @click="emit('select', name)"
          />
        </li>
      </ul>
    </div>
  </UCard>
</template>
