# Config Variants

<p>
  <!-- Uncomment the npm badge after the first npm publication.
  <a href="https://npmx.dev/package/@happydesigns/config-variants"><img src="https://img.shields.io/npm/v/@happydesigns/config-variants.svg?style=flat&amp;colorA=18181B&amp;colorB=F28564" alt="npm version"></a>
  -->
  <a href="LICENSE"><img src="https://img.shields.io/github/license/happydesigns/config-variants?style=flat&amp;colorA=18181B&amp;colorB=F28564" alt="MIT license"></a>
  <a href="docs/content/docs/10.platform-preview.md#portable-core"><img src="https://img.shields.io/badge/TypeScript-18181B?logo=typescript" alt="TypeScript guide"></a>
  <a href="docs/content/docs/1.getting-started.md"><img src="https://img.shields.io/badge/Nuxt-18181B?logo=nuxt" alt="Nuxt quickstart"></a>
  <a href="docs/content/docs/10.platform-preview.md#comark-content"><img src=".github/badges/comark-content.svg" alt="Comark Content guide"></a>
</p>

Config Variants is a TypeScript library for composing named configurations from shared settings. A data record, a route, or application code selects a variant. Each variant can inherit settings and override the values that differ.

## Quick start

```bash
pnpm add @happydesigns/config-variants
```

For example, an app might define settings for a standard CSV export. An audit export can inherit those settings and change the delimiter.

```ts
import { createVariantResolver } from "@happydesigns/config-variants";

const reports = createVariantResolver({
  csv: { config: { delimiter: ",", includeHeader: true } },
  audit: { extends: "csv", config: { delimiter: ";" } },
});

const { config } = reports.resolve("audit");
console.log(config); // { delimiter: ";", includeHeader: true }
```

The [core guide](docs/content/docs/10.platform-preview.md#portable-core) covers resolving variants from data records and applying overrides per call.

## Integrations

| Integration | Entry point | Use |
| --- | --- | --- |
| Comark Content | `/comark-content` | [Validate variant selections and keep them in content snapshots](docs/content/docs/10.platform-preview.md#comark-content). |
| Nuxt | Package name in `modules` | [Select variants on routes, read reactive config, and trace values in Nuxt DevTools](docs/content/docs/1.getting-started.md). |
| Nuxt Content v3 | `/schemas` | [Compose collection schemas from shared fields](docs/content/docs/5.content-schemas.md). |
| DevFrame | `/devtools` | [Run the inspector in a standalone host](docs/content/docs/10.platform-preview.md#standalone-inspector). |

Nuxt resolves the module entry automatically. Import [Nuxt-specific types](docs/content/docs/3.api.md) from `@happydesigns/config-variants/nuxt`.

## Upgrading

See the [migration guide](docs/content/docs/9.migration-0-3.md) when upgrading from `@happydesigns/nuxt-variants`.

## Development

Use the Node.js and pnpm versions declared in [`package.json`](package.json).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open **Editorial documents** in the playground to see Comark Content select `article` or `event` from Markdown frontmatter. Run `pnpm docs` for the documentation site and `pnpm check` for lint, type checks, and tests.

Contributors can [build a local package](docs/content/docs/10.platform-preview.md#build-the-local-package) to test their changes in another app before the next npm release.

See [Contributing](CONTRIBUTING.md) for the package and release checks, [Architecture](ARCHITECTURE.md) for the system boundaries, and the [comparison guide](docs/content/docs/10.platform-preview.md#compare-and-verify) for the side-by-side inspector. The [Course pilot](docs/course-pilot.md) covers a real upgrade and rollback.
