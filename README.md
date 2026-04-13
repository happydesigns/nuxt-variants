# nuxt-variants

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-href]][nuxt-href]

A centralized, deeply-merging configuration engine for Nuxt layouts. Define reusable feature configs, compose them into layout variants via an `extends` chain, and resolve the fully merged config at runtime — with `app.config` overrides layered on top of `nuxt.config` base definitions.

- [✨ Release Notes](/CHANGELOG.md)

## Features

- **Flat variant registry** — define features and layout variants in one place
- **Deep merge with array overwrite** — configs are deeply merged; arrays are replaced, not concatenated
- **`extends` chain** — variants inherit from one or more parent variants, resolved bottom-up
- **Two-layer config** — `nuxt.config` sets build-time defaults; `app.config` overrides at runtime (Nuxt Studio compatible)
- **Reactive composables** — `useVariant` and `useVariants` return `ComputedRef`s that update live when `app.config` changes
- **Full TypeScript inference** — `CustomVariantRegistry` is auto-generated from your config; augment it for narrower types
- **Build-time variant graph** — the `extends` inheritance tree is computed once at build time and exposed as a virtual module (`#variants-graph`)
- **Nuxt Content v3 schema merging** — `mergeVariantSchemas` walks the variant graph and produces a single merged Zod or Valibot schema for use with `defineCollection`

## Quick Setup

```bash
npx nuxt module add @h4designs/nuxt-variants
```

## Basic Usage

### 1. Define the registry in `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ["@h4designs/nuxt-variants"],
  variants: {
    registry: {
      // Feature: a reusable config block with no parents
      breadcrumbs: {
        config: { separator: " / ", showHome: true },
      },
      hero: {
        config: { height: "md", overlay: false },
      },
      seo: {
        config: { titleTemplate: "%s - My Site" },
      },
      // Layout variant: composes features and overrides specific values
      article: {
        extends: ["breadcrumbs", "hero", "seo"],
        config: { height: "sm", authorBox: true },
      },
      // Shorthand: an array of parent names with no own config
      event: ["breadcrumbs", "hero"],
    },
  },
});
```

### 2. Override at runtime in `app.config.ts`

Values set here win over `nuxt.config` without a rebuild — compatible with Nuxt Studio.

```ts
export default defineAppConfig({
  variants: {
    article: {
      config: { authorBox: false }, // overrides nuxt.config's default of true
    },
  },
});
```

### 3. Resolve config in a component

```ts
// Fully typed when the variant name is a literal string
const { config } = useVariant("article");
config.value.height; // string | undefined
config.value.showHome; // boolean | undefined
config.value.authorBox; // boolean | undefined

// Reactive name — pass a ref or getter directly
const variantName = computed(() => route.meta.variant ?? "article");
const { config, has } = useVariant(variantName);

// Check feature inheritance at any depth
const hasBreadcrumbs = has("breadcrumbs");
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
const route = useRoute();
const variantName = computed(() => route.meta.variant ?? "article");

const { config, has } = useVariant(variantName);
const hasBreadcrumbs = has("breadcrumbs");
</script>
```

Each page sets its variant via `definePageMeta` — no layout duplication needed:

```ts
// pages/article.vue
definePageMeta({ layout: "content", variant: "article" });

// pages/landing.vue
definePageMeta({ layout: "content", variant: "landing" });
```

## Nuxt Content v3 Integration

`nuxt-variants` ships `mergeVariantSchemas` for use in `content.config.ts`. It produces a single merged Zod or Valibot schema covering a variant's full inheritance chain, so every inherited field becomes a typed SQLite column in Nuxt Content v3.

### Setup

```ts
// content.config.ts
import { defineCollection } from "@nuxt/content";
import { z } from "zod";
import { mergeVariantSchemas, type SchemaRegistry } from "@h4designs/nuxt-variants/schemas";

const variantSchemas: SchemaRegistry = {
  seo: z.object({ seoTitle: z.string() }),
  article: z.object({ authorName: z.string() }),
};

export const collections = {
  blog: defineCollection({
    type: "page",
    source: "blog/**",
    // article extends seo → merged schema has both seoTitle and authorName
    schema: mergeVariantSchemas(["article"], variantSchemas),
  }),
};
```

With the `article → seo` inheritance defined in `nuxt.config.ts`, `mergeVariantSchemas` produces a schema equivalent to:

```ts
z.object({ seoTitle: z.string(), authorName: z.string() });
```

No manual schema composition needed. Add a field to the `seo` schema and every collection that uses an `article`-derived variant picks it up automatically.

### `mergeVariantSchemas(activeVariants, registry, graph?)`

| Parameter        | Type                                  | Description                                                                                       |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `activeVariants` | `string[]`                            | Variant keys whose schemas should be merged                                                       |
| `registry`       | `SchemaRegistry`                      | Map of variant name → Zod or Valibot object schema                                                |
| `graph`          | `Record<string, string[]>` \| omitted | Inheritance graph. When omitted the module-injected graph from `globalThis` is used automatically |

Resolution order is bottom-up: ancestor schemas are merged first so child schemas correctly override parent fields.

All schemas in a single `mergeVariantSchemas` call must use the same validator library (all Zod or all Valibot). Mixing them throws an error.

## TypeScript

### Auto-generated types

`nuxt-variants` generates `CustomVariantRegistry` automatically from your `nuxt.config.ts` registry and `app.config.ts` values — no manual type declarations required. Config value shapes are widened to their primitive types (`string`, `number`, `boolean`), and inherited properties from all ancestors are included.

After running `nuxt prepare` (or `pnpm dev`), `useVariant('article')` already returns a typed `ComputedRef` with every inherited key in scope:

```ts
const { config } = useVariant("article");
config.value.separator; // string | undefined  (inherited from breadcrumbs)
config.value.height; // string | undefined  (inherited from hero)
config.value.authorBox; // boolean | undefined (own config)
```

### `VariantConfigOf<K>`

Use the exported `VariantConfigOf` helper to reference a variant's resolved config type anywhere in your codebase:

```ts
import type { VariantConfigOf } from "#nuxt-variants";

type ArticleConfig = VariantConfigOf<"article">;
// Partial<{ separator: string; showHome: boolean; height: string; overlay: boolean; authorBox: boolean }>

function renderArticle(config: ArticleConfig) { … }
```

### Optional: manual augmentation for precise types

The auto-generated types widen literal values to their base primitives. If you need narrow types (e.g. `"sm" | "md" | "lg"` instead of `string`), augment `CustomVariantRegistry` manually:

```ts
// types/variants.d.ts
declare module "#nuxt-variants" {
  interface CustomVariantRegistry {
    hero: {
      height: "sm" | "md" | "lg" | "xl";
      overlay: boolean;
    };
    article: {
      separator: string;
      showHome: boolean;
      height: "sm" | "md" | "lg" | "xl";
      overlay: boolean;
      titleTemplate: string;
      authorBox: boolean;
    };
  }
}
```

Manual entries override the auto-generated ones for the keys you specify.

## Module Options

| Option      | Type                                | Default      | Description                                    |
| ----------- | ----------------------------------- | ------------ | ---------------------------------------------- |
| `registry`  | `Record<string, VariantDefinition>` | `{}`         | Build-time variant definitions                 |
| `configKey` | `string`                            | `'variants'` | Key used in `app.config` for runtime overrides |

## `VariantDefinition`

```ts
interface VariantDefinition<T> {
  extends?: string | string[]; // parent variant(s) to inherit from
  active?: boolean; // set to false to exclude this variant from resolution (default: true)
  config: Partial<T>; // the config values this variant contributes
}
```

**Shorthand:** if a variant only inherits from parents with no own config, you can write it as a plain array of parent names:

```ts
registry: {
  event: ["breadcrumbs", "hero"], // same as { extends: ["breadcrumbs", "hero"] }
}
```

## Composables

### `useVariant(name)`

Resolves a variant by merging its config with all inherited parents. Returns `{ config, has }`.

- `name` — `MaybeRefOrGetter<string>` — variant key, or a ref/getter of one
- Merge priority (highest → lowest): variant's own `app.config` → variant's own `nuxt.config` → last parent → … → first parent
- If a variant's `active` is set to `false`, it resolves to an empty config

#### `config`

`ComputedRef<VariantConfigOf<K>>` — the fully merged config object. Updates reactively when `app.config` changes.

#### `has(featureName)`

Returns a `ComputedRef<boolean>` that is `true` if this variant directly or transitively extends `featureName`. Safe against circular `extends` chains.

- `featureName` — `MaybeRefOrGetter<string>`

```ts
const { config, has } = useVariant("article");
const hasBreadcrumbs = has("breadcrumbs"); // ComputedRef<boolean>
```

### `useVariants()`

Returns a `ComputedRef<VariantEntry[]>` — a flat list of all variants from both `nuxt.config` and `app.config`, each with its resolved `extends` chain and union of config keys.

```ts
interface VariantEntry {
  name: string;
  extends: string[]; // resolved extends chain (app.config wins over nuxt.config)
  configKeys: string[];
}
```

## Virtual Modules

### `#variants-graph`

Exported by the module at build time. Contains the pre-computed inheritance graph:

```ts
import { variantGraph } from "#variants-graph";
// { article: ['breadcrumbs', 'hero', 'seo'], seo: [], hero: [], ... }
```

Use this anywhere outside of Nuxt's Vite pipeline (e.g. `content.config.ts`) by importing from the generated file directly:

```ts
import { variantGraph } from "./.nuxt/variants-graph.mjs";
```

## How merging works

Given the following registry:

```ts
base:    { config: { color: 'blue', size: 'md' } }
variant: { extends: ['base'], config: { size: 'lg' } }
```

`useVariant('variant').value` resolves to `{ color: 'blue', size: 'lg' }` — the variant's own `size` overrides the parent's, but `color` is inherited.

If `app.config` also defines:

```ts
variant: {
  config: {
    size: "xl";
  }
}
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
pnpm prepare

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

[npm-version-src]: https://img.shields.io/npm/v/@h4designs/nuxt-variants/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@h4designs/nuxt-variants
[npm-downloads-src]: https://img.shields.io/npm/dm/@h4designs/nuxt-variants.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@h4designs/nuxt-variants
[license-src]: https://img.shields.io/npm/l/@h4designs/nuxt-variants.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@h4designs/nuxt-variants
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
