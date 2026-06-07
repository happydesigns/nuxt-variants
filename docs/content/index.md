---
title: Nuxt Variants
description: Build one shared Nuxt layout and drive page-specific behavior from a typed variant graph.
---

::u-page-hero
---
headline: Typed layout variants for Nuxt
title: Modularize your Nuxt layouts.
description: Define reusable layout capabilities once, compose them into named page variants, and let one Nuxt layout resolve the behavior each route needs.
links:
  - label: Get started
    to: /docs/getting-started
    color: primary
    size: lg
    trailingIcon: i-lucide-arrow-right
  - label: View examples
    to: /docs/examples
    color: neutral
    icon: i-lucide-layout-template
    size: lg
    variant: subtle
---

::landing-workbench
---
graphLabel: variant graph resolves at runtime
resolvedLabel: Resolved page
extendsLabel: Extends
featureChecksLabel: Feature checks
configLabel: Resolved config
articleLabel: Article
articleSummary: Long-form content with navigation, metadata, and reading aids.
landingLabel: Landing
landingSummary: Campaign pages with a larger hero and focused calls to action.
eventLabel: Event
eventSummary: Time-bound pages with shared hero behavior and event-specific data.
---

#code
:::code-tree{default-value="nuxt.config.ts" expand-all}

```ts [nuxt.config.ts]
export default defineNuxtConfig({
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
});
```

```ts [app.config.ts]
export default defineAppConfig({
  variants: {
    article: {
      config: {
        heroAlign: "center",
        relatedLimit: 4,
      },
    },
  },
});
```

```vue [pages/blog/[slug].vue]
<script setup lang="ts">
definePageMeta({
  layout: "content",
  variant: "article",
});
</script>
```

```vue [layouts/content.vue]
<script setup lang="ts">
const route = useRoute();
const variant = computed(() => route.meta.variant ?? "article");
const { config, has } = useVariant(variant);
const hasBreadcrumbs = has("breadcrumbs");
const hasToc = has("toc");
</script>

<template>
  <BreadcrumbBar v-if="hasBreadcrumbs" />
  <HeroSection :height="config.heroHeight" :align="config.heroAlign" />
  <ArticleToc v-if="hasToc" />
  <slot />
</template>
```

:::
::

::

::landing-mental-model
---
eyebrow: The mental model
title: One layout can serve every page type.
description: Nuxt Variants keeps app-specific decisions out of the layout file. Features stay small, page variants compose them, and the layout consumes one resolved result.
---

::landing-feature{icon="i-lucide-route" number="01" title="Pages choose a name"}
Route meta selects `article`, `landing`, `event`, or any variant your app owns.
::

::landing-feature{icon="i-lucide-git-merge" number="02" title="The graph composes features"}
`extends` composes reusable feature variants such as breadcrumbs, hero, SEO, TOC, schemas, and local overrides.
::

::landing-feature{icon="i-lucide-panel-top" number="03" title="Layouts consume one result"}
`useVariant` returns the merged config and feature checks for the current route.
::

::

::u-page-section
---
title: Where the graph pays off.
description: Nuxt Variants owns page-level configuration and leaves rendering, styling, and content authoring to Nuxt.
features:
  - icon: i-lucide-layout-panel-left
    title: Shared layout behavior
    description: Switch hero size, breadcrumbs, sidebar placement, TOC, and editorial chrome without cloning layouts.
  - icon: i-lucide-database
    title: Content-aware schemas
    description: Keep Nuxt Content fields aligned with the same variant graph that powers rendering.
  - icon: i-lucide-monitor-cog
    title: Transparent debugging
    description: Inspect inheritance, config layers, resolved output, and diagnostics in Nuxt DevTools.
---
::

::u-page-c-t-a
---
title: Create your first variant graph.
description: Install the module, define a registry, and move page-specific behavior out of your layout.
orientation: horizontal
variant: subtle
links:
  - label: Install the module
    to: /docs/getting-started
    icon: i-lucide-rocket
    color: neutral
    variant: subtle
    size: lg
    trailingIcon: i-lucide-arrow-right
  - label: Understand the model
    to: /docs/concepts
    icon: i-lucide-book-open
    color: neutral
    variant: subtle
    size: lg
    trailingIcon: i-lucide-arrow-right
  - label: Reference the API
    to: /docs/api
    icon: i-lucide-code-xml
    color: neutral
    variant: subtle
    size: lg
    trailingIcon: i-lucide-arrow-right
---
::
