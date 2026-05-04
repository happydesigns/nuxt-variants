---
title: nuxt-variants
description: Centralized, deeply merged layout variant configuration for Nuxt applications.
---

# nuxt-variants

Build one shared Nuxt layout and drive its behavior with named variants.
Define reusable feature configs, compose them into page variants, and let
`app.config` override the resolved result at runtime.

::card-group

## ::card

title: Install the module
icon: i-lucide-package
to: /docs/getting-started

---

Add `@happydesigns/nuxt-variants` to a Nuxt app and define your first registry.
::

## ::card

title: Learn the model
icon: i-lucide-git-branch
to: /docs/concepts

---

Understand features, layout variants, inheritance, runtime overrides, and merge priority.
::

## ::card

title: Use the API
icon: i-lucide-code
to: /docs/api

---

Reference `useVariant`, `useVariants`, `mergeVariantSchemas`, and virtual modules.
::

:::

## Why Variants?

Nuxt layouts are good at sharing structure, but real sites often need a page to
switch individual capabilities on and off: hero size, breadcrumbs, sidebar
placement, table of contents, SEO defaults, or content schema fields.

`nuxt-variants` keeps that configuration in one registry. Pages select a
variant with `definePageMeta`, layouts resolve the merged config with
`useVariant`, and editors can override values through `app.config` without
duplicating layouts.

::tip
The module is useful when feature composition is more important than creating a
new layout for every content type.
::
