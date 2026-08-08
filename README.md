# Nuxt Variants

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt Variants is a small Nuxt module for building one shared layout that can behave differently per page. Define reusable feature configs, compose them into named page variants, and resolve the merged result in your layout with `useVariant`.

The package name is `@happydesigns/nuxt-variants`.

## Why Use It?

Nuxt layouts are good at sharing structure, but real projects often need page-level switches for things like hero size, breadcrumbs, table of contents, sidebars, SEO defaults, and content schema fields. Without a shared registry, those switches tend to drift into duplicated layouts and one-off route logic.

Nuxt Variants keeps those decisions in one registry:

- `nuxt.config.ts` defines build-time defaults.
- `app.config.ts` overrides values at runtime.
- Pages select a variant with `definePageMeta`.
- Layouts call `useVariant` and render from the resolved config.
- Nuxt Content can merge schemas from the same variant inheritance graph.

## Features

- Flat variant registry for both reusable features and page variants.
- Deep object merge with array replacement, not array concatenation.
- `extends` inheritance across direct and transitive parents.
- Runtime `app.config` overrides for Nuxt Studio-compatible editing.
- Auto-generated TypeScript types through `#nuxt-variants`.
- Build-time virtual graph through `#variants-graph`.
- Build-time diagnostics for unknown parents, inheritance cycles, and replaced parent chains.
- Nuxt DevTools tab for inspecting variants, inheritance, config layers, and resolved output during development.
- Graph-aware Nuxt Content schema helper through `@happydesigns/nuxt-variants/schemas`.

## Quick Setup

Use Node.js 22.19 or newer on the 22.x release line, Node.js 24.11 or newer on
the 24.x release line, or Node.js 26+.

```bash
npx nuxt module add @happydesigns/nuxt-variants
```

Manual install:

pnpm:

```bash
pnpm add @happydesigns/nuxt-variants
```

npm:

```bash
npm install @happydesigns/nuxt-variants
```

yarn:

```bash
yarn add @happydesigns/nuxt-variants
```

bun:

```bash
bun add @happydesigns/nuxt-variants
```

Then register the module:

```ts
export default defineNuxtConfig({
  modules: ["@happydesigns/nuxt-variants"],
});
```

## Basic Usage

### 1. Define Variants

```ts
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
          heroOverlay: false,
          heroAlign: "left",
        },
      },
      seo: {
        config: {
          titleTemplate: "%s - My Site",
        },
      },
      article: {
        extends: ["breadcrumbs", "hero", "seo"],
        config: {
          heroHeight: "sm",
          authorBox: true,
        },
      },
      event: ["breadcrumbs", "hero"],
    },
  },
});
```

### 2. Override At Runtime

```ts
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

`app.config.ts` wins over `nuxt.config.ts` for the same variant, so editors can change runtime behavior without creating a new layout.

### 3. Select A Variant Per Page

```ts
definePageMeta({
  layout: "content",
  variant: "article",
});
```

### 4. Resolve The Variant In A Layout

```vue
<template>
  <BreadcrumbBar v-if="hasBreadcrumbs" :separator="config.breadcrumbSeparator" />
  <HeroSection :height="config.heroHeight" :overlay="config.heroOverlay" />
  <slot />
</template>

<script setup lang="ts">
const route = useRoute();
const variantName = computed(() => route.meta.variant ?? "article");

const { config, has } = useVariant(variantName);
const hasBreadcrumbs = has("breadcrumbs");
</script>
```

When the variant name is a literal, `config` is typed from the generated registry:

```ts
const { config, has } = useVariant("article");

config.value.heroHeight;
config.value.breadcrumbSeparator;
config.value.authorBox;

has("seo").value; // true
```

## Nuxt Content

Nuxt Variants ships `mergeVariantSchemas` for Nuxt Content v3. It walks the variant graph and produces one Zod or Valibot object schema with inherited fields included.

Keep the registry in a normal TypeScript file when both Nuxt and Nuxt Content
need it. This avoids module-order and virtual-alias coupling.

```ts
// variants.ts
export const variantRegistry = {
  seo: {},
  article: { extends: ["seo"] },
};
```

```ts
// nuxt.config.ts
import { variantRegistry } from "./variants";

export default defineNuxtConfig({
  modules: ["@happydesigns/nuxt-variants", "@nuxt/content"],
  variants: { registry: variantRegistry },
});
```

```ts
// content.config.ts
import { defineCollection } from "@nuxt/content";
import { z } from "zod";
import { createVariantGraph, mergeVariantSchemas } from "@happydesigns/nuxt-variants/schemas";
import { variantRegistry } from "./variants";

const variantSchemas = {
  seo: z.object({ seoTitle: z.string() }),
  article: z.object({ authorName: z.string() }),
};
const variantGraph = createVariantGraph(variantRegistry);

export const collections = {
  blog: defineCollection({
    type: "page",
    source: "blog/**",
    schema: mergeVariantSchemas(["article"], variantSchemas, variantGraph),
  }),
};
```

The explicit graph is required. Unknown active variants and schema registry keys
throw immediately instead of producing an incomplete collection schema.

## TypeScript

The module generates `CustomVariantRegistry` and `VariantConfigOf` in `#nuxt-variants` during Nuxt prepare.

```ts
import type { VariantConfigOf } from "#nuxt-variants";

type ArticleConfig = VariantConfigOf<"article">;
```

Generated config values are widened to primitive types. If you need narrower
literal unions, augment `CustomVariantOverrides` in a module declaration:

```ts
export {};

declare module "#nuxt-variants" {
  interface CustomVariantOverrides {
    hero: {
      heroHeight: "sm" | "md" | "lg" | "xl";
      heroOverlay: boolean;
      heroAlign: "left" | "center" | "right";
    };
  }
}
```

An override replaces the inferred config type for that registry entry and is
also applied when another variant inherits the entry. It changes TypeScript
types only; runtime values still come from `nuxt.config.ts` and
`app.config.ts`.

## API Overview

`useVariant(name)` returns `{ config, features, has }`.

- `config` is a `ComputedRef` of the fully merged config.
- `features` is a `ComputedRef<ReadonlySet<string>>` resolved once per reactive change.
- `has(featureName)` returns a `ComputedRef<boolean>` when the selected variant
  is that feature or inherits it directly or transitively.
- `name` and `featureName` can be strings, refs, computed refs, or getters.
- `active: false` disables both resolved config and `has()` checks for that variant.

`useVariants()` returns a computed list of known variants:

```ts
interface VariantEntry {
  name: string;
  extends: string[];
  configKeys: string[];
}
```

Virtual modules:

- `#nuxt-variants` exposes generated types.
- `#variants-graph` exposes `variantGraph` and `variantDiagnostics`.
- `#variants-schemas` exposes graph-aware schema helpers inside Nuxt's Vite pipeline. Use the package `schemas` export from `content.config.ts`.

Development tooling:

- The Nuxt DevTools tab named `Nuxt Variants` shows the current variant list, inheritance graph, active features, base/app config layers, resolved config, and diagnostics.
- The backing inspector route is registered only in Nuxt dev and test environments.

## Merge Rules

For a variant's own config, `app.config.ts` wins over `nuxt.config.ts`.

For every registry entry, `app.config.ts` overrides `nuxt.config.ts`. Across the
inheritance graph, parents are resolved first and the child overrides them. If
multiple parents define the same value, the later parent in `extends` wins.
Arrays are replaced:

```ts
base: {
  config: { slots: ["header", "main"], color: "blue" },
},
article: {
  extends: ["base"],
  config: { slots: ["article"], density: "comfortable" },
},
```

Resolving `article` produces:

```ts
{
  slots: ["article"],
  color: "blue",
  density: "comfortable",
}
```

## Diagnostics

During Nuxt prepare, Nuxt Variants warns about registry graph problems:

- variants extending unknown parent keys
- circular inheritance chains
- `app.config` entries that replace an existing `nuxt.config` `extends` chain

The same warnings are available as `variantDiagnostics` from `#variants-graph` and in the Nuxt DevTools inspector.

## Playground And Documentation

The repository pins pnpm through `packageManager`, so Corepack and CI use the
same package manager version.

```bash
pnpm install
pnpm dev
```

The playground demonstrates shared layouts, feature composition, runtime overrides, generated type contracts, and Nuxt Content schema merging.

```bash
pnpm docs:dev
```

The Docus documentation source lives in [`docs/`](/docs). See [`CONTRIBUTING.md`](/CONTRIBUTING.md) for branch, commit, and PR rules.

## Local Checks

```bash
pnpm dev:prepare
pnpm lint
pnpm typecheck
pnpm test
pnpm prepack
pnpm dev:build
pnpm docs:build
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@happydesigns/nuxt-variants/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@happydesigns/nuxt-variants
[npm-downloads-src]: https://img.shields.io/npm/dm/@happydesigns/nuxt-variants.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@happydesigns/nuxt-variants
[license-src]: https://img.shields.io/npm/l/@happydesigns/nuxt-variants.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@happydesigns/nuxt-variants
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
