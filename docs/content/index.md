---
title: Nuxt Variants
description: Build one shared Nuxt layout and drive page-specific behavior from a typed variant graph.
---

::u-page-hero
---
headline: Composable page behavior for Nuxt
title: Share one layout without hard-coding every page type.
description: Name reusable capabilities such as headers, tables of contents, and navigation, compose them into page variants, and resolve the result from any Nuxt layout.
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
graphLabel: variant graph compiled at build time
resolvedLabel: Resolved page
extendsLabel: Extends
featureChecksLabel: Feature checks
configLabel: Resolved config
articleLabel: Article
articleSummary: Long-form content with navigation, metadata, and reading aids.
contentLabel: Content
contentSummary: Regular content with an optional header and table of contents.
eventLabel: Event
eventSummary: Time-bound content with dates, location, and shared reading tools.
---

#code
:::code-tree{default-value="nuxt.config.ts" expand-all}

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@happydesigns/nuxt-variants"],
  variants: {
    registry: {
      dates: {},
      authors: {},
      location: {},
      header: {},
      toc: {},
      copyButton: {},
      surround: {},
      article: {
        extends: ["dates", "authors", "header", "toc", "copyButton", "surround"],
        config: {},
      },
      event: {
        extends: ["dates", "location", "header", "toc", "copyButton", "surround"],
        config: {},
      },
      content: ["header", "toc"],
    },
  },
});
```

```ts [app.config.ts]
export default defineAppConfig({
  variants: {
    copyButton: {
      config: {
        copyButton: { label: "Copy URL", successLabel: "Link copied" },
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
const hasHeader = has("header");
const hasToc = has("toc");
const hasCopyButton = has("copyButton");
const hasSurround = has("surround");
</script>

<template>
  <UPage>
    <UPageHeader v-if="hasHeader" />
    <UPageBody>
      <slot />
      <HCopyButton v-if="hasCopyButton" v-bind="config.copyButton" />
      <HSurround v-if="hasSurround" />
    </UPageBody>
    <template v-if="hasToc" #right>
      <UContentToc />
    </template>
  </UPage>
</template>
```

:::
::

::

::landing-mental-model
---
eyebrow: The mental model
title: One layout, explicit capabilities.
description: Articles, events, and regular content can share a shell without collection-name checks or duplicated layouts. Small traits describe the differences and page variants compose them.
---

::landing-feature{icon="i-lucide-route" number="01" title="Pages choose a name"}
Route meta selects `article`, `landing`, `event`, or any variant your app owns.
::

::landing-feature{icon="i-lucide-git-merge" number="02" title="The graph composes features"}
`extends` composes reusable capabilities such as headers, TOC, authors, locations, copy actions, and previous/next navigation.
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
    description: Share headers, TOC placement, copy actions, and previous/next navigation without cloning layouts.
  - icon: i-lucide-database
    title: Content-aware schemas
    description: Keep Nuxt Content fields aligned with the same variant graph that powers rendering.
  - icon: i-lucide-monitor-cog
    title: Transparent debugging
    description: Inspect resolution order, activity, source layers, raw inputs, and resolved output in Nuxt DevTools.
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
