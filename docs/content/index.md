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
    size: xl
    trailingIcon: i-lucide-arrow-right
  - label: View examples
    to: /docs/examples
    color: neutral
    icon: i-lucide-layout-template
    size: xl
    variant: outline
ui:
  container: "py-12 sm:py-16 lg:py-20 gap-10"
  title: "text-5xl sm:text-7xl lg:text-8xl text-pretty tracking-tight font-bold text-highlighted"
  description: "text-base sm:text-xl/8 text-muted max-w-3xl mx-auto"
  footer: "mt-8"
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
</script>

<template>
  <BreadcrumbBar v-if="has('breadcrumbs')" />
  <HeroSection :height="config.heroHeight" :align="config.heroAlign" />
  <ArticleToc v-if="has('toc')" />
  <slot />
</template>
```

:::
::

::

::landing-mental-model

#eyebrow
The mental model

#title
A page variant is a composed feature set.

#description
Nuxt Variants keeps the app-specific decisions out of the layout file. The layout stays stable; page types carry the configuration.

::landing-feature{icon="i-lucide-route" number="01" title="Pages choose a name"}
Route meta selects `article`, `landing`, `event`, or any variant your app owns.
::

::landing-feature{icon="i-lucide-git-merge" number="02" title="The graph composes features"}
`extends` pulls in breadcrumbs, hero, SEO, sidebar, schemas, and local overrides.
::

::landing-feature{icon="i-lucide-panel-top" number="03" title="Layouts consume one result"}
`useVariant` returns the merged config and feature checks for the current page.
::

::

::u-page-section
---
title: One graph, three places it pays off.
description: The module stays deliberately small. It owns variant configuration and leaves rendering, styling, and content authoring to Nuxt.
features:
  - icon: i-lucide-layout-panel-left
    title: Layout behavior
    description: Switch hero size, breadcrumbs, sidebar placement, TOC, and editorial chrome without cloning layouts.
  - icon: i-lucide-database
    title: Content schemas
    description: Keep Nuxt Content fields aligned with the same variant graph that powers rendering.
  - icon: i-lucide-monitor-cog
    title: Debugging
    description: Inspect inheritance, config layers, resolved output, and diagnostics in Nuxt DevTools.
ui:
  container: "py-12 sm:py-16 lg:py-20 gap-10"
  title: "text-3xl sm:text-5xl text-pretty tracking-tight font-bold text-highlighted"
  description: "text-base sm:text-lg text-muted max-w-3xl mx-auto"
  features: "mx-auto max-w-6xl gap-px overflow-hidden rounded-2xl border border-default bg-default sm:grid-cols-3 [&>*]:bg-muted/20 [&>*]:p-6"
---
::

::u-page-cta
---
title: Build the first variant graph in minutes.
description: Next step
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
ui:
  root: "mx-auto my-12 max-w-5xl"
---
::
