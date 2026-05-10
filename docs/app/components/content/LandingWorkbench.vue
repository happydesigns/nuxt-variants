<script setup lang="ts">
import { defineComponent, h, markRaw } from "vue";
import { ProsePre } from "#components";

interface CodeFile {
  name: string;
  language: string;
  code: string;
}

const variants = [
  {
    name: "article",
    label: "Article",
    path: "pages/blog/[slug].vue",
    extends: ["breadcrumbs", "hero", "seo", "toc"],
    summary: "Long-form content with navigation, metadata, and reading aids.",
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
    label: "Landing",
    path: "pages/index.vue",
    extends: ["hero", "seo"],
    summary: "Campaign pages with a larger hero and focused calls to action.",
    config: {
      heroHeight: "xl",
      heroAlign: "center",
      ctaStyle: "split",
      titleTemplate: "%s - Product",
    },
  },
  {
    name: "event",
    label: "Event",
    path: "pages/events/[slug].vue",
    extends: ["breadcrumbs", "hero", "seo"],
    summary: "Time-bound pages with shared hero behavior and event-specific data.",
    config: {
      heroHeight: "md",
      heroAlign: "left",
      schedule: true,
      titleTemplate: "%s - Events",
    },
  },
];

const scriptCloseTag = `</${"script"}>`;

const codeFiles = [
  {
    name: "nuxt.config.ts",
    language: "ts",
    code: `export default defineNuxtConfig({
  modules: ["@happydesigns/nuxt-variants"],
  variants: {
    registry: {
      breadcrumbs: {
        config: { separator: " / ", showHome: true },
      },
      hero: {
        config: { heroHeight: "md", heroAlign: "left" },
      },
      seo: {
        config: { titleTemplate: "%s - Guides" },
      },
      toc: {
        config: { toc: "right" },
      },
      article: {
        extends: ["breadcrumbs", "hero", "seo", "toc"],
        config: { heroHeight: "sm", authorBox: true },
      },
    },
  },
});`,
  },
  {
    name: "app.config.ts",
    language: "ts",
    code: `export default defineAppConfig({
  variants: {
    article: {
      config: {
        heroAlign: "center",
        relatedLimit: 4,
      },
    },
  },
});`,
  },
  {
    name: "pages/blog/[slug].vue",
    language: "vue",
    code: `<script setup lang="ts">
definePageMeta({
  layout: "content",
  variant: "article",
});
${scriptCloseTag}`,
  },
  {
    name: "layouts/content.vue",
    language: "vue",
    code: `<script setup lang="ts">
const route = useRoute();
const variant = computed(() => route.meta.variant ?? "article");
const { config, has } = useVariant(variant);
${scriptCloseTag}

<template>
  <BreadcrumbBar v-if="has('breadcrumbs')" />
  <HeroSection :height="config.heroHeight" :align="config.heroAlign" />
  <ArticleToc v-if="has('toc')" />
  <slot />
</template>`,
  },
] satisfies CodeFile[];

const selectedVariantName = ref("article");
const selectedFileName = ref<string | undefined>("nuxt.config.ts");

const selectedVariant = computed(
  () => variants.find((variant) => variant.name === selectedVariantName.value) ?? variants[0],
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

const tokenPattern =
  /(&quot;[^&]*?&quot;|\b(?:export|default|const|return|true|false)\b|\b(?:defineNuxtConfig|defineAppConfig|definePageMeta|useRoute|computed|useVariant)\b|&lt;\/?[A-Za-z][^&\s]*|\b[A-Za-z_$][\w$]*(?=\s*:))/g;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const highlightCode = (value: string) =>
  escapeHtml(value).replace(tokenPattern, (token) => {
    if (token.startsWith("&quot;")) {
      return `<span class="text-primary">${token}</span>`;
    }

    if (token === "true" || token === "false") {
      return `<span class="text-warning">${token}</span>`;
    }

    if (token.startsWith("&lt;")) {
      return `<span class="text-primary">${token}</span>`;
    }

    if (
      /^[a-zA-Z_$][\w$]*$/.test(token) &&
      !["export", "default", "const", "return"].includes(token)
    ) {
      return `<span class="text-info">${token}</span>`;
    }

    return `<span class="text-secondary">${token}</span>`;
  });

const createCodeTreeComponent = (file: CodeFile) =>
  markRaw(
    defineComponent({
      name: `LandingWorkbenchCode${file.name.replace(/\W+/g, "")}`,
      setup() {
        return () =>
          h(
            ProsePre,
            {
              code: file.code,
              filename: file.name,
              language: file.language,
              ui: {
                root: "my-0 h-full rounded-none border-0",
                base: "h-full min-h-[386px] overflow-auto rounded-none border-0 bg-transparent text-[13px] leading-6",
              },
            },
            {
              default: () =>
                h("code", {
                  class: "font-mono",
                  innerHTML: highlightCode(file.code),
                }),
            },
          );
      },
    }),
  );

const codeTreeItems = codeFiles.map((file) => ({
  label: file.name,
  component: createCodeTreeComponent(file),
}));
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
        variant graph resolves at runtime
      </div>
    </div>

    <div class="grid items-stretch lg:grid-cols-[minmax(0,1fr)_360px]">
      <ProseCodeTree
        v-model="selectedFileName"
        :items="codeTreeItems"
        default-value="nuxt.config.ts"
        expand-all
        :ui="{
          root: 'my-0 h-full min-h-[480px] rounded-none border-0 lg:h-full',
          list: 'bg-muted/30',
          content:
            'bg-elevated/40 lg:border-r border-default [&>div]:overflow-y-auto [&>div>div]:border-0',
        }"
      />

      <section class="h-full bg-default p-4">
        <div class="mb-4">
          <p class="text-xs font-medium uppercase tracking-wide text-primary">Resolved page</p>
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
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Extends</p>
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
              Feature checks
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
              Resolved config
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
