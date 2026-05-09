<script setup lang="ts">
const variants = [
  {
    name: "article",
    label: "Article",
    extends: ["breadcrumbs", "hero", "seo", "toc"],
    config: {
      heroHeight: "sm",
      heroAlign: "center",
      toc: "right",
      authorBox: true,
      relatedLimit: 4,
    },
    summary: "Content page with navigation, metadata, and reading aids.",
  },
  {
    name: "landing",
    label: "Landing",
    extends: ["hero", "seo"],
    config: {
      heroHeight: "xl",
      heroAlign: "center",
      ctaStyle: "split",
      authorBox: false,
    },
    summary: "Marketing page with a larger hero and focused calls to action.",
  },
  {
    name: "event",
    label: "Event",
    extends: ["breadcrumbs", "hero", "seo"],
    config: {
      heroHeight: "md",
      heroAlign: "left",
      schedule: true,
      toc: "hidden",
    },
    summary: "Time-bound page with shared hero behavior and event-specific data.",
  },
];

const selectedName = ref("article");

const selectedVariant = computed(
  () => variants.find((variant) => variant.name === selectedName.value) ?? variants[0],
);

const resolvedFeatures = computed(() => [
  ...selectedVariant.value.extends,
  selectedVariant.value.name,
]);

const configRows = computed(() =>
  Object.entries(selectedVariant.value.config).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  })),
);
</script>

<template>
  <div class="rounded-xl border border-default bg-default p-4 shadow-sm">
    <div
      class="flex flex-col gap-3 border-b border-default pb-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-muted">Resolver Preview</p>
        <h3 class="mt-1 text-lg font-semibold text-highlighted">
          One layout, selected by page meta
        </h3>
      </div>

      <div class="flex rounded-lg border border-default bg-muted p-1">
        <button
          v-for="variant in variants"
          :key="variant.name"
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="
            selectedName === variant.name
              ? 'bg-default text-highlighted shadow-sm'
              : 'text-muted hover:text-highlighted'
          "
          :aria-pressed="selectedName === variant.name"
          @click="selectedName = variant.name"
        >
          {{ variant.label }}
        </button>
      </div>
    </div>

    <div class="space-y-5 pt-4">
      <div>
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-highlighted">{{ selectedVariant.name }}</p>
          <span class="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {{ resolvedFeatures.length }} active features
          </span>
        </div>
        <p class="text-sm text-muted">{{ selectedVariant.summary }}</p>
      </div>

      <div class="rounded-lg border border-default bg-muted/40 p-3">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Extends Chain</p>
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span
            v-for="feature in selectedVariant.extends"
            :key="feature"
            class="rounded-md border border-default bg-default px-2.5 py-1 text-muted"
          >
            {{ feature }}
          </span>
          <span class="text-muted">-></span>
          <span
            class="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-medium text-primary"
          >
            {{ selectedVariant.name }}
          </span>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-default p-3">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Feature Checks</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="feature in resolvedFeatures"
              :key="feature"
              class="rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
            >
              has("{{ feature }}")
            </span>
          </div>
        </div>

        <div class="rounded-lg border border-default p-3">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Resolved Config</p>
          <dl class="space-y-1.5 text-sm">
            <div
              v-for="row in configRows"
              :key="row.key"
              class="flex items-center justify-between gap-3"
            >
              <dt class="text-muted">{{ row.key }}</dt>
              <dd class="font-mono text-highlighted">{{ row.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
