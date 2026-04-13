# Changelog

## v0.0.5

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.0.4...v0.0.5)

### 🚀 Enhancements

- Auto-generate CustomVariantRegistry from app.config.ts ([95b7b9f](https://github.com/happydesigns/nuxt-variants/commit/95b7b9f))
- Include inherited variant configs in CustomVariantRegistry types ([347734d](https://github.com/happydesigns/nuxt-variants/commit/347734d))
- Allow shorthand registry entries to reduce boilerplate ([eae3fe4](https://github.com/happydesigns/nuxt-variants/commit/eae3fe4))
- Export VariantConfigOf from generated #nuxt-variants template ([965542c](https://github.com/happydesigns/nuxt-variants/commit/965542c))

### 🩹 Fixes

- **ci:** Use prepare instead of non-existent dev:prepare script ([6348657](https://github.com/happydesigns/nuxt-variants/commit/6348657))
- **typecheck:** Exclude test fixtures from root vue-tsc and type $fetch as string ([9c21b6a](https://github.com/happydesigns/nuxt-variants/commit/9c21b6a))

### 📖 Documentation

- Update README for auto-generated types, shorthand syntax, VariantConfigOf ([7b685cd](https://github.com/happydesigns/nuxt-variants/commit/7b685cd))

### 🏡 Chore

- Add test coverage ([b868074](https://github.com/happydesigns/nuxt-variants/commit/b868074))
- Lint ([91b67a8](https://github.com/happydesigns/nuxt-variants/commit/91b67a8))

### ✅ Tests

- Add unit tests for merge utility and schema adapters ([9436de1](https://github.com/happydesigns/nuxt-variants/commit/9436de1))
- **fixture:** Add variants fixture for E2E composable tests ([45c6b27](https://github.com/happydesigns/nuxt-variants/commit/45c6b27))
- Add E2E tests for useVariant, has(), and useVariants ([99d2971](https://github.com/happydesigns/nuxt-variants/commit/99d2971))
- Cover cycle-detection guard in resolveExtendsGraph ([40ffcdb](https://github.com/happydesigns/nuxt-variants/commit/40ffcdb))

### 🎨 Styles

- Apply oxfmt formatting ([f9e0dde](https://github.com/happydesigns/nuxt-variants/commit/f9e0dde))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.0.4

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.0.3...v0.0.4)

### 🚀 Enhancements

- Generate #variants-schemas virtual module with baked-in graph ([3e9acba](https://github.com/happydesigns/nuxt-variants/commit/3e9acba))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.0.3

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.0.2...v0.0.3)

### 🩹 Fixes

- Add schemas subpath export as built dist entry ([99d5d1d](https://github.com/happydesigns/nuxt-variants/commit/99d5d1d))

### 📖 Documentation

- Update readme for auto-injected variant graph in mergeVariantSchemas ([a5c95c3](https://github.com/happydesigns/nuxt-variants/commit/a5c95c3))

### 🏡 Chore

- Add unbuild as explicit dev dependency ([1055bc1](https://github.com/happydesigns/nuxt-variants/commit/1055bc1))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.0.2

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.0.1...v0.0.2)

### 🚀 Enhancements

- Auto-inject variant graph into mergeVariantSchemas utility ([47c1faa](https://github.com/happydesigns/nuxt-variants/commit/47c1faa))

### 📖 Documentation

- Update readme ([88b9bcc](https://github.com/happydesigns/nuxt-variants/commit/88b9bcc))

### 🏡 Chore

- Set publishConfig access to public ([bc84b07](https://github.com/happydesigns/nuxt-variants/commit/bc84b07))
- Lint ([48a246c](https://github.com/happydesigns/nuxt-variants/commit/48a246c))
- Fix readme typo ([776b1f1](https://github.com/happydesigns/nuxt-variants/commit/776b1f1))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.0.1

### 🚀 Enhancements

- **module:** Implement ModuleOptions, runtimeConfig injection, and auto-imports ([0858550](https://github.com/happydesigns/nuxt-variants/commit/0858550))
- **utils:** Add defuReplaceArray custom deep-merge that overwrites arrays ([2c0a209](https://github.com/happydesigns/nuxt-variants/commit/2c0a209))
- **composables:** Add useVariant with recursive extends resolution and cycle guard ([e465d32](https://github.com/happydesigns/nuxt-variants/commit/e465d32))
- **composables:** Add useVariantExtends for transitive feature detection ([2e72c90](https://github.com/happydesigns/nuxt-variants/commit/2e72c90))
- **playground:** Configure variant registry with feature and layout variants ([9820e6e](https://github.com/happydesigns/nuxt-variants/commit/9820e6e))
- **playground:** Add shared content layout with variant-driven conditional rendering ([7ceb65c](https://github.com/happydesigns/nuxt-variants/commit/7ceb65c))
- **playground:** Add index, article, event, and landing pages ([02ddd35](https://github.com/happydesigns/nuxt-variants/commit/02ddd35))
- **playground:** Add TypeScript module augmentation for CustomVariantRegistry ([0140b37](https://github.com/happydesigns/nuxt-variants/commit/0140b37))
- **playground:** Move most variant config to app.config and showcase override behavior ([08990c8](https://github.com/happydesigns/nuxt-variants/commit/08990c8))
- **composables:** Add useVariantRegistry and simplify playground index to use it ([06784ed](https://github.com/happydesigns/nuxt-variants/commit/06784ed))
- **composables:** Make useVariant, useVariantExtends, and useVariantRegistry reactive ([8a4d965](https://github.com/happydesigns/nuxt-variants/commit/8a4d965))
- **playground:** Demonstrate literal-string type inference in page components ([bbfa67e](https://github.com/happydesigns/nuxt-variants/commit/bbfa67e))
- **module:** Implement build-time virtualization bridge for variant graph ([e33eea6](https://github.com/happydesigns/nuxt-variants/commit/e33eea6))
- **schemas:** Implement build-time schema resolution engine ([3a199c5](https://github.com/happydesigns/nuxt-variants/commit/3a199c5))
- **playground:** Wire up Nuxt Content v3 schema merging and runtime variant demo ([4f39cbb](https://github.com/happydesigns/nuxt-variants/commit/4f39cbb))
- **playground:** Expand showcase with full registry and blog Content v3 demo ([613801e](https://github.com/happydesigns/nuxt-variants/commit/613801e))
- **playground:** Refactor playground to use Nuxt UI with grid layout design ([f14fd5b](https://github.com/happydesigns/nuxt-variants/commit/f14fd5b))

### 🩹 Fixes

- **playground:** Access registry.value after useVariantRegistry became a ComputedRef ([0c68b2a](https://github.com/happydesigns/nuxt-variants/commit/0c68b2a))
- **types:** Wire CustomVariantRegistry through #nuxt-variants alias for correct module augmentation ([28eb8d0](https://github.com/happydesigns/nuxt-variants/commit/28eb8d0))
- **schemas:** Satisfy Standard Schema v1 interface for Nuxt Content v3 compatibility ([d1f32ea](https://github.com/happydesigns/nuxt-variants/commit/d1f32ea))
- Infer config type implicitly for dynamic variant names ([ae566ed](https://github.com/happydesigns/nuxt-variants/commit/ae566ed))
- **module:** Fix runtimeConfig assignment and variants-graph type resolution ([229cb46](https://github.com/happydesigns/nuxt-variants/commit/229cb46))
- **build:** Annotate defuReplaceArray with explicit DefuFn type ([06236fa](https://github.com/happydesigns/nuxt-variants/commit/06236fa))
- **build:** Use ReturnType<typeof createDefu> to annotate defuReplaceArray ([9ce03b5](https://github.com/happydesigns/nuxt-variants/commit/9ce03b5))

### 💅 Refactors

- **playground:** Reduce nuxt.config registry to base features and partial article variant ([dc27682](https://github.com/happydesigns/nuxt-variants/commit/dc27682))
- **playground:** Derive variant index dynamically from runtime registry with source badges ([f406a63](https://github.com/happydesigns/nuxt-variants/commit/f406a63))
- **composables:** Remove source tracking from useVariantRegistry ([ed98ce6](https://github.com/happydesigns/nuxt-variants/commit/ed98ce6))
- Consolidate composables into useVariant and useVariants ([75fc4ec](https://github.com/happydesigns/nuxt-variants/commit/75fc4ec))

### 📖 Documentation

- Write README with setup, usage, TypeScript augmentation, and API reference ([f7c2235](https://github.com/happydesigns/nuxt-variants/commit/f7c2235))
- Update README with build-time graph, Content v3 schema merging, and virtual modules ([a5a734d](https://github.com/happydesigns/nuxt-variants/commit/a5a734d))

### 🏡 Chore

- Init module ([a3387c6](https://github.com/happydesigns/nuxt-variants/commit/a3387c6))
- **release:** Prepare package.json for npm publish ([5184f0b](https://github.com/happydesigns/nuxt-variants/commit/5184f0b))
- Rename package to @h4designs/nuxt-variants ([6647ada](https://github.com/happydesigns/nuxt-variants/commit/6647ada))
- **tooling:** Add oxlint with VS Code integration ([de7ca4c](https://github.com/happydesigns/nuxt-variants/commit/de7ca4c))
- **tooling:** Replace eslint with oxlint + oxfmt ([d904eb6](https://github.com/happydesigns/nuxt-variants/commit/d904eb6))
- Lint ([f72ba6e](https://github.com/happydesigns/nuxt-variants/commit/f72ba6e))
- Add prepare and typecheck scripts ([8a3198c](https://github.com/happydesigns/nuxt-variants/commit/8a3198c))
- Migrate workspaces to pnpm-workspace.yaml and fix tsconfig paths ([73366fc](https://github.com/happydesigns/nuxt-variants/commit/73366fc))
- Update lint settings ([5e98ef7](https://github.com/happydesigns/nuxt-variants/commit/5e98ef7))
- Lint ([2df1902](https://github.com/happydesigns/nuxt-variants/commit/2df1902))
- Set up oxlint/oxfmt for Vue and consolidate lint scripts ([0f0b215](https://github.com/happydesigns/nuxt-variants/commit/0f0b215))
- Reorder Vue SFC blocks to script-first ([44633a0](https://github.com/happydesigns/nuxt-variants/commit/44633a0))
- **playground:** Improve contrast, hierarchy and layout polish ([e03904b](https://github.com/happydesigns/nuxt-variants/commit/e03904b))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))
