# Composable Variants

Resolve typed, named configurations from reusable variant definitions.

```ts
import { createVariantResolver } from "@happydesigns/composable-variants";

const resolver = createVariantResolver({
  toc: { config: { showToc: true } },
  article: { extends: "toc" },
});

resolver.resolve("article").config; // { showToc: true }
```

The main import only needs `defu`. The `/comark-content` entry point uses the
optional `comark-content` peer. The `/devtools` entry point uses the optional
`devframe` peer. Nuxt users install [`@happydesigns/nuxt-variants`](https://www.npmjs.com/package/@happydesigns/nuxt-variants).

The Nuxt and core packages share a release version. Import paths under
`/internal` are reserved for the accompanying Nuxt integration.
