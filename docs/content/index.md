---
title: Nuxt Variants
description: Build one shared Nuxt layout and drive page-specific behavior from a typed variant graph.
---

::u-page-hero
---
ui:
  container: py-14 sm:py-16 lg:py-20 gap-8
  title: text-4xl sm:text-6xl lg:text-7xl text-pretty tracking-tight font-bold text-highlighted
  description: text-base sm:text-lg/8 text-muted max-w-3xl mx-auto
  footer: mt-8
---
#title
One Nuxt layout. Many page shapes.

#description
Nuxt Variants keeps layout capabilities in a flat registry, composes them with `extends`, and gives your pages a deeply merged config that can also drive Nuxt Content schemas and DevTools inspection.

#links
  :::u-button
  ---
  color: primary
  size: xl
  to: /docs/getting-started
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: i-lucide-layout-template
  size: xl
  to: /docs/examples
  variant: outline
  ---
  See examples
  :::
::

::u-page-section
---
title: For content sites where layouts should not multiply
description: Share the structure once, then let each route select the capabilities it needs.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-git-branch
    to: /docs/concepts
    ---
    #title
    Compose features

    #description
    Model reusable capabilities like breadcrumbs, hero, SEO, sidebar, or table of contents as registry entries.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-settings-2
    to: /docs/api
    ---
    #title
    Resolve behavior

    #description
    Call `useVariant` in one layout to receive merged config and feature checks for the current page.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-database
    to: /docs/content-schemas
    ---
    #title
    Reuse the graph

    #description
    Merge Zod or Valibot schemas through the same inheritance graph that controls the layout.
    ::::
  :::
::

::u-page-section
---
title: See the graph resolve
description: The registry defines reusable feature defaults, pages select a named variant, and the layout consumes one resolved result.
---
  :::landing-showcase
    ::::code-tree{default-value="nuxt.config.ts"}
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
              heroHeight: "md",
              heroAlign: "left",
              heroOverlay: false,
            },
          },
          seo: {
            config: {
              titleTemplate: "%s - Guides",
            },
          },
          toc: {
            config: {
              toc: "right",
            },
          },
          article: {
            extends: ["breadcrumbs", "hero", "seo", "toc"],
            config: {
              heroHeight: "sm",
              authorBox: true,
            },
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

    ```vue [pages/blog/article.vue]
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
    const variantName = computed(() => route.meta.variant ?? "article");

    const { config, has } = useVariant(variantName);
    const showBreadcrumbs = has("breadcrumbs");
    const showToc = has("toc");
    </script>

    <template>
      <BreadcrumbBar
        v-if="showBreadcrumbs"
        :separator="config.breadcrumbSeparator"
      />

      <HeroSection
        :align="config.heroAlign"
        :height="config.heroHeight"
        :overlay="config.heroOverlay"
      />

      <ArticleToc v-if="showToc" />
      <slot />
    </template>
    ```
    ::::

    ::::variant-flow-demo
    ::::
  :::
::

::u-page-section
---
title: Built for the parts that usually drift
description: "Nuxt Variants is deliberately small: it owns layout behavior configuration and leaves rendering, styling, and content authoring to Nuxt."
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-sliders-horizontal
    ---
    #title
    Runtime overrides

    #description
    Let `app.config.ts` tune values without duplicating layout files or changing the original registry.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-braces
    to: /docs/typescript
    ---
    #title
    Generated types

    #description
    Use generated variant config types and optional module augmentation when you need narrower literal unions.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-monitor-cog
    to: /docs/concepts#devtools-inspector
    ---
    #title
    Transparent debugging

    #description
    Inspect variants, inheritance, active features, config layers, resolved output, and diagnostics in Nuxt DevTools.
    ::::
  :::
::

::u-page-section
---
title: Start with the right guide
description: Pick the entry point that matches what you need to understand next.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-rocket
    to: /docs/getting-started
    ---
    #title
    Install and define a registry

    #description
    Add the module, create your first feature entries, and resolve a variant in a layout.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-book-open
    to: /docs/concepts
    ---
    #title
    Understand the model

    #description
    Learn how feature entries, page variants, inheritance, merge order, and diagnostics fit together.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code-xml
    to: /docs/api
    ---
    #title
    Check the API

    #description
    Reference module options, composables, virtual modules, schema helpers, and DevTools behavior.
    ::::
  :::
::
