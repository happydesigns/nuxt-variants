<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";
const props = defineProps<{ variant: VariantEntry; entries: VariantEntry[] }>();
const names = computed(() => new Set(props.entries.map((entry) => entry.name)));
defineEmits<{ select: [name: string] }>();
</script>
<template>
  <section
    v-if="variant.extends.length || variant.activeFeatures.length > 1 || variant.sources.length"
    aria-labelledby="variant-composition"
    class="border-t border-default pt-5"
  >
    <h2 id="variant-composition" class="mb-3 text-base font-semibold text-highlighted">
      Composition
    </h2>
    <dl
      class="grid content-start gap-x-4 gap-y-2 text-sm sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline"
    >
      <template v-if="variant.extends.length">
        <dt class="text-muted">Direct parents</dt>
        <dd class="flex flex-wrap gap-1.5">
          <UButton
            v-for="parent in variant.extends"
            :key="parent"
            :label="parent"
            :disabled="!names.has(parent)"
            color="neutral"
            variant="subtle"
            size="sm"
            class="max-w-full font-mono wrap-anywhere"
            @click="$emit('select', parent)"
          />
        </dd>
      </template>
      <template v-if="variant.activeFeatures.length > 1">
        <dt class="text-muted">Resolution order</dt>
        <dd>
          <ol class="flex flex-wrap items-center gap-1">
            <li
              v-for="(name, i) in variant.activeFeatures"
              :key="name"
              class="inline-flex max-w-full items-center gap-1"
            >
              <UIcon
                v-if="i"
                name="i-lucide-chevron-right"
                class="size-3.5 shrink-0 text-dimmed"
                aria-hidden="true"
              />
              <UBadge
                v-if="name === variant.name"
                variant="subtle"
                class="font-mono wrap-anywhere"
                >{{ name }}</UBadge
              >
              <UButton
                v-else
                :label="name"
                color="neutral"
                variant="ghost"
                size="sm"
                class="min-w-0 font-mono wrap-anywhere"
                @click="$emit('select', name)"
              />
            </li>
          </ol>
        </dd>
      </template>
      <template v-if="variant.sources.length">
        <dt class="text-muted">Declared in</dt>
        <dd>
          <ul class="space-y-1">
            <li
              v-for="source in variant.sources"
              :key="source.kind + ':' + source.name"
              class="flex flex-wrap items-baseline gap-x-2"
            >
              <span class="font-mono wrap-anywhere">{{ source.name }}</span>
              <span class="text-xs text-muted">{{ source.kind }}</span>
            </li>
          </ul>
        </dd>
      </template>
    </dl>
  </section>
</template>
