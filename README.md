# nuxt-variants

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A centralized, deeply-merging configuration engine for Nuxt layouts. Define reusable feature configs, compose them into layout variants via an `extends` chain, and resolve the fully merged config at runtime — with `app.config` overrides layered on top of `nuxt.config` base definitions.

- [✨ Release Notes](/CHANGELOG.md)

## Features

- **Flat variant registry** — define features and layout variants in one place
- **Deep merge with array overwrite** — configs are deeply merged; arrays are replaced, not concatenated
- **`extends` chain** — variants inherit from one or more parent variants, resolved bottom-up
- **Two-layer config** — `nuxt.config` sets build-time defaults; `app.config` overrides at runtime (Nuxt Studio compatible)
- **Reactive composables** — `useVariant` and `useVariantExtends` return `ComputedRef`s that update live when `app.config` changes
- **Full TypeScript inference** — augment `#nuxt-variants` to get typed config per variant key

## Quick Setup

```bash
npx nuxt module add nuxt-variants
```

## Basic Usage

### 1. Define the registry in `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['nuxt-variants'],
  variants: {
    registry: {
      // Feature: a reusable config block with no parents
      breadcrumbs: {
        config: { separator: ' / ', showHome: true },
      },
      hero: {
        config: { height: 'md', overlay: false },
      },
      // Layout variant: composes features and overrides specific values
      article: {
        extends: ['breadcrumbs', 'hero'],
        config: { height: 'sm' },
      },
    },
  },
})
```

### 2. Override at runtime in `app.config.ts`

Values set here win over `nuxt.config` without a rebuild — compatible with Nuxt Studio.

```ts
export default defineAppConfig({
  variants: {
    article: {
      config: { height: 'lg' }, // overrides nuxt.config's 'sm'
    },
    // You can also define entirely new variants here
    landing: {
      extends: ['hero'],
      config: { height: 'xl', overlay: true },
    },
  },
})
```

### 3. Resolve config in a component

```ts
// Fully typed when the variant name is a literal string
const config = useVariant('article')
config.value.height   // string | undefined
config.value.showHome // boolean | undefined

// Reactive name — pass a ref or getter directly
const variantName = computed(() => route.meta.variant ?? 'article')
const config = useVariant(variantName)

// Check feature inheritance at any depth
const hasBreadcrumbs = useVariantExtends(variantName, 'breadcrumbs')
// hasBreadcrumbs.value → true (article extends breadcrumbs)
```

### 4. Conditional rendering in a shared layout

```vue
<template>
  <BreadcrumbBar v-if="hasBreadcrumbs" :separator="config.separator" />
  <HeroSection :height="config.height" :overlay="config.overlay" />
  <slot />
</template>

<script setup lang="ts">
const route = useRoute()
const variantName = computed(() => route.meta.variant ?? 'article')

const config = useVariant(variantName)
const hasBreadcrumbs = useVariantExtends(variantName, 'breadcrumbs')
</script>
```

Each page sets its variant via `definePageMeta` — no layout duplication needed:

```ts
// pages/article.vue
definePageMeta({ layout: 'content', variant: 'article' })

// pages/landing.vue
definePageMeta({ layout: 'content', variant: 'landing' })
```

## TypeScript

Augment `#nuxt-variants` in your project to get typed config per variant key.
After adding the augmentation, `useVariant('article')` returns
`ComputedRef<Partial<ArticleConfig>>` with full autocomplete.

```ts
// types/variants.d.ts
declare module '#nuxt-variants' {
  interface CustomVariantRegistry {
    breadcrumbs: { separator: string; showHome: boolean }
    hero: { height: 'sm' | 'md' | 'lg' | 'xl'; overlay: boolean }
    article: { separator: string; showHome: boolean; height: 'sm' | 'md' | 'lg' | 'xl'; overlay: boolean }
  }
}
```

For layout variants that combine multiple feature types, use intersections:

```ts
interface BreadcrumbsConfig { separator: string; showHome: boolean }
interface HeroConfig { height: 'sm' | 'md' | 'lg' | 'xl'; overlay: boolean }

declare module '#nuxt-variants' {
  interface CustomVariantRegistry {
    breadcrumbs: BreadcrumbsConfig
    hero: HeroConfig
    article: BreadcrumbsConfig & HeroConfig
  }
}
```

## Module Options

| Option | Type | Default | Description |
|---|---|---|---|
| `registry` | `Record<string, VariantDefinition>` | `{}` | Build-time variant definitions |
| `configKey` | `string` | `'variants'` | Key used in `app.config` for runtime overrides |

## `VariantDefinition`

```ts
interface VariantDefinition<T> {
  extends?: string | string[]  // parent variant(s) to inherit from
  active?: boolean             // set to false to disable the variant entirely
  config: Partial<T>           // the config values this variant contributes
}
```

## Composables

### `useVariant(name)`

Resolves a variant by merging its config with all inherited parents. Returns a reactive `ComputedRef` that updates when `app.config` changes.

- `name` — `MaybeRefOrGetter<string>` — variant key, or a ref/getter of one
- Merge priority (highest → lowest): variant's own `app.config` → variant's own `nuxt.config` → last parent → … → first parent

### `useVariantExtends(variantName, featureName)`

Returns a `ComputedRef<boolean>` that is `true` if `variantName` directly or transitively extends `featureName`. Safe against circular `extends` chains.

- Both parameters accept `MaybeRefOrGetter<string>`

### `useVariantRegistry()`

Returns a `ComputedRef<RegistryEntry[]>` — a flat list of all variants from both `nuxt.config` and `app.config`, each with its resolved `extends` chain and union of config keys.

```ts
interface RegistryEntry {
  name: string
  extends: string[]   // resolved extends chain (app.config wins over nuxt.config)
  configKeys: string[]
}
```

## How merging works

Given the following registry:

```ts
base: { config: { color: 'blue', size: 'md' } }
variant: { extends: ['base'], config: { size: 'lg' } }
```

`useVariant('variant').value` resolves to `{ color: 'blue', size: 'lg' }` — the variant's own `size` overrides the parent's, but `color` is inherited.

If `app.config` also defines:

```ts
variant: { config: { size: 'xl' } }
```

The result is `{ color: 'blue', size: 'xl' }` — `app.config` always wins over `nuxt.config` for the same variant.

Arrays in config are **replaced**, not concatenated, when a child overrides a parent's array value.

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  pnpm install

  # Generate type stubs
  pnpm dev:prepare

  # Develop with the playground
  pnpm dev

  # Build the playground
  pnpm dev:build

  # Run ESLint
  pnpm lint

  # Run Vitest
  pnpm test
  pnpm test:watch

  # Release new version
  pnpm release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-variants/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-variants

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-variants.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-variants

[license-src]: https://img.shields.io/npm/l/nuxt-variants.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-variants

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
