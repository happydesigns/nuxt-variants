---
title: Nuxt Variants
description: Centralized, deeply merged layout variant configuration for Nuxt applications.
---

::u-page-hero
#title
Nuxt Variants

#description
Compose named feature configs, resolve deeply merged layout behavior, and keep content schema fields aligned with the same variant graph.

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
  icon: i-lucide-code
  size: xl
  to: /docs/api
  variant: outline
  ---
  API reference
  :::
::

::u-page-section
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-git-branch
    to: /docs/concepts
    ---
    #title
    Feature composition

    #description
    Split layout capabilities into reusable feature entries, then compose page variants with `extends`.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-settings-2
    to: /docs/api
    ---
    #title
    Runtime resolution

    #description
    Read merged variant config with `useVariant` and check inherited feature presence with `has`.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-monitor-cog
    to: /docs/concepts#devtools-inspector
    ---
    #title
    DevTools inspector

    #description
    Inspect variants, inherited features, config layers, resolved output, and diagnostics in Nuxt DevTools.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-database
    to: /docs/content-schemas
    ---
    #title
    Content schemas

    #description
    Merge Zod or Valibot schemas through the same graph that drives layout behavior.
    ::::
  :::
::

::u-page-section
---
title: Why Nuxt Variants?
description: Nuxt layouts are good at sharing structure, but content-heavy sites often need pages to switch individual capabilities on and off without duplicating entire layouts.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-panels-top-left
    ---
    #title
    One layout, many page shapes

    #description
    Model article, landing, event, and product page behavior through config instead of creating a layout for every combination.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-sliders-horizontal
    ---
    #title
    Runtime overrides

    #description
    Let `app.config` override build-time defaults for editorial tuning without changing the module registry.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-braces
    ---
    #title
    Typed helpers

    #description
    Use generated variant types and virtual modules so layouts can consume config with predictable TypeScript support.
    ::::
  :::
::
