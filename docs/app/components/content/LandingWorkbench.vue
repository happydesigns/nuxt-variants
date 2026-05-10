<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    graphLabel?: string;
    resolvedLabel?: string;
    extendsLabel?: string;
    featureChecksLabel?: string;
    configLabel?: string;
    articleLabel?: string;
    articleSummary?: string;
    landingLabel?: string;
    landingSummary?: string;
    eventLabel?: string;
    eventSummary?: string;
  }>(),
  {
    graphLabel: "variant graph resolves at runtime",
    resolvedLabel: "Resolved page",
    extendsLabel: "Extends",
    featureChecksLabel: "Feature checks",
    configLabel: "Resolved config",
    articleLabel: "Article",
    articleSummary: "Long-form content with navigation, metadata, and reading aids.",
    landingLabel: "Landing",
    landingSummary: "Campaign pages with a larger hero and focused calls to action.",
    eventLabel: "Event",
    eventSummary: "Time-bound pages with shared hero behavior and event-specific data.",
  },
);

const variants = computed(() => [
  {
    name: "article",
    label: props.articleLabel,
    extends: ["breadcrumbs", "hero", "seo", "toc"],
    summary: props.articleSummary,
    config: {
      heroHeight: "sm",
      heroAlign: "center",
      toc: "right",
      authorBox: true,
      relatedLimit: 4,
    },
  },
  {
    name: "landing",
    label: props.landingLabel,
    extends: ["hero", "seo"],
    summary: props.landingSummary,
    config: {
      heroHeight: "xl",
      heroAlign: "center",
      ctaStyle: "split",
      titleTemplate: "%s - Product",
    },
  },
  {
    name: "event",
    label: props.eventLabel,
    extends: ["breadcrumbs", "hero", "seo"],
    summary: props.eventSummary,
    config: {
      heroHeight: "md",
      heroAlign: "left",
      schedule: true,
      titleTemplate: "%s - Events",
    },
  },
]);

const selectedVariantName = ref("article");

const selectedVariant = computed(
  () =>
    variants.value.find((variant) => variant.name === selectedVariantName.value) ??
    variants.value[0],
);

const activeFeatures = computed(() => [
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
  <div
    class="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-default bg-default/80 text-left shadow-2xl shadow-black/10 backdrop-blur"
  >
    <div class="flex items-center justify-between border-b border-default px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-error" />
        <span class="size-2.5 rounded-full bg-warning" />
        <span class="size-2.5 rounded-full bg-success" />
      </div>
      <div class="hidden items-center gap-2 text-xs text-muted sm:flex">
        <UIcon name="i-lucide-git-branch" class="size-4" />
        {{ graphLabel }}
      </div>
    </div>

    <div class="grid items-stretch lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="landing-workbench-code min-w-0">
        <slot name="code" />
      </div>

      <section class="h-full bg-default p-4">
        <div class="mb-4">
          <p class="text-xs font-medium uppercase tracking-wide text-primary">
            {{ resolvedLabel }}
          </p>
          <h3 class="mt-1 text-xl font-semibold text-highlighted">{{ selectedVariant.label }}</h3>
          <p class="mt-1 text-sm text-muted">{{ selectedVariant.summary }}</p>
        </div>

        <div class="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-default bg-muted p-1">
          <button
            v-for="variant in variants"
            :key="variant.name"
            type="button"
            class="rounded-lg px-2 py-2 text-sm font-medium transition"
            :class="
              selectedVariantName === variant.name
                ? 'bg-default text-highlighted shadow-sm'
                : 'text-muted hover:text-highlighted'
            "
            :aria-pressed="selectedVariantName === variant.name"
            @click="selectedVariantName = variant.name"
          >
            {{ variant.label }}
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {{ extendsLabel }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="feature in selectedVariant.extends"
                :key="feature"
                class="rounded-md border border-default bg-muted px-2.5 py-1 text-xs text-muted"
              >
                {{ feature }}
              </span>
              <span class="text-muted">-></span>
              <span class="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {{ selectedVariant.name }}
              </span>
            </div>
          </div>

          <div>
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {{ featureChecksLabel }}
            </p>
            <div class="grid grid-cols-2 gap-2">
              <span
                v-for="feature in activeFeatures"
                :key="feature"
                class="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 font-mono text-xs text-primary"
              >
                has("{{ feature }}")
              </span>
            </div>
          </div>

          <div class="rounded-xl border border-default bg-muted/30 p-3">
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {{ configLabel }}
            </p>
            <dl class="space-y-2 text-sm">
              <div
                v-for="row in configRows"
                :key="row.key"
                class="flex items-center justify-between gap-4"
              >
                <dt class="text-muted">{{ row.key }}</dt>
                <dd class="font-mono text-highlighted">{{ row.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.landing-workbench-code :deep(> div) {
  margin: 0;
  height: 100%;
  min-height: 480px;
  border-width: 0;
  border-radius: 0;
}

.landing-workbench-code :deep(pre) {
  font-size: 13px;
  line-height: 1.5rem;
}
</style>
