<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";
const props = defineProps<{ variant: VariantEntry; entries: VariantEntry[] }>();
const names = computed(() => new Set(props.entries.map((entry) => entry.name)));
defineEmits<{ select: [name: string] }>();
</script>
<template>
  <div class="flex flex-col gap-6">
    <section>
      <h2 class="mb-2 text-sm font-semibold text-highlighted">Direct parents</h2>
      <div v-if="variant.extends.length" class="flex flex-wrap gap-2">
        <UButton
          v-for="parent in variant.extends"
          :key="parent"
          :label="parent"
          :disabled="!names.has(parent)"
          color="neutral"
          variant="subtle"
          size="sm"
          class="font-mono"
          @click="$emit('select', parent)"
        />
      </div>
      <p v-else class="text-sm text-muted">None</p>
    </section>
    <section v-if="variant.activeFeatures.length">
      <h2 class="mb-2 text-sm font-semibold text-highlighted">Resolution order</h2>
      <ol class="flex flex-wrap items-center gap-1.5">
        <li
          v-for="(name, i) in variant.activeFeatures"
          :key="name"
          class="inline-flex items-center gap-1.5"
        >
          <UIcon
            v-if="i"
            name="i-lucide-chevron-right"
            class="size-3.5 text-dimmed"
            aria-hidden="true"
          />
          <UBadge v-if="name === variant.name" variant="subtle" class="font-mono">{{
            name
          }}</UBadge>
          <UButton
            v-else
            :label="name"
            color="neutral"
            variant="ghost"
            size="sm"
            class="font-mono"
            @click="$emit('select', name)"
          />
        </li>
      </ol>
    </section>
    <section v-if="variant.sources.length">
      <h2 class="mb-2 text-sm font-semibold text-highlighted">Declared in</h2>
      <ul class="divide-y divide-default rounded-lg border border-default">
        <li
          v-for="source in variant.sources"
          :key="source.kind + ':' + source.name"
          class="flex items-center justify-between gap-3 px-3 py-2"
        >
          <span class="wrap-anywhere font-mono text-sm">{{ source.name }}</span>
          <span class="text-xs text-muted">{{ source.kind }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
