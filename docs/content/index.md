---
title: nuxt-variants
description: Centralized, deeply merged layout variant configuration for Nuxt applications.
---

# nuxt-variants

Build one shared Nuxt layout and drive its behavior with named variants. Define
reusable feature configs, compose them into page variants, and let `app.config`
override the resolved result at runtime.

## Start Here

- [Get started](/docs/getting-started): install the module, define a registry,
  and resolve your first variant.
- [Understand the model](/docs/concepts): learn how features, layout variants,
  inheritance, and merge priority work.
- [Use the API](/docs/api): reference composables, schema helpers, module
  options, and virtual modules.

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
