---
title: Getting Started
description: Install nuxt-variants and define your first layout variant registry.
---

# Getting Started

## Install

```bash [Terminal]
npx nuxt module add @happydesigns/nuxt-variants
```

Or install the package with your package manager and add it to `nuxt.config.ts`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@happydesigns/nuxt-variants"],
});
```

## Define A Registry

The registry is flat. Some entries are reusable feature configs. Other entries
are page or layout variants that extend those features.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@happydesigns/nuxt-variants"],
  variants: {
    registry: {
      breadcrumbs: {
        config: {
          breadcrumbSeparator: " / ",
          breadcrumbShowHome: true,
        },
      },
      hero: {
        config: {
          heroHeight: "md" as const,
          heroOverlay: false,
          heroAlign: "left" as const,
        },
      },
      article: {
        extends: ["breadcrumbs", "hero"],
        config: {
          heroHeight: "sm" as const,
          authorBox: true,
        },
      },
    },
  },
});
```

## Override At Runtime

Values in `app.config.ts` win over values from `nuxt.config.ts`.

```ts [app.config.ts]
export default defineAppConfig({
  variants: {
    article: {
      config: {
        heroAlign: "center",
        authorBox: false,
      },
    },
  },
});
```

## Resolve In A Layout

```vue [layouts/content.vue]
<script setup lang="ts">
const route = useRoute();
const variantName = computed(() => route.meta.variant ?? "article");

const { config, has } = useVariant(variantName);
const hasBreadcrumbs = has("breadcrumbs");
</script>

<template>
  <BreadcrumbBar v-if="hasBreadcrumbs" :separator="config.breadcrumbSeparator" />

  <HeroSection
    :height="config.heroHeight"
    :align="config.heroAlign"
    :overlay="config.heroOverlay"
  />

  <slot />
</template>
```

## Select Variants Per Page

```vue [pages/article.vue]
<script setup lang="ts">
definePageMeta({
  layout: "content",
  variant: "article",
});
</script>
```

::note
Run `pnpm prepare` or start Nuxt after changing the registry so generated
variant types and virtual modules are refreshed.
::
