# Changelog

## v0.2.0

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.1.1...v0.2.0)

### 🚀 Enhancements

- **registry:** Add typed registry authoring ([68ff6a4](https://github.com/happydesigns/nuxt-variants/commit/68ff6a4))
- **core:** ⚠️  Separate structural and runtime variants ([b10263f](https://github.com/happydesigns/nuxt-variants/commit/b10263f))
- **devtools:** Expose variant layer provenance ([12f702e](https://github.com/happydesigns/nuxt-variants/commit/12f702e))
- **types:** ⚠️  Strengthen runtime variant contracts ([fac94af](https://github.com/happydesigns/nuxt-variants/commit/fac94af))
- **devtools:** Turn the registry view into an inspector ([4670133](https://github.com/happydesigns/nuxt-variants/commit/4670133))
- **types:** Expose dynamic variant name input ([98e6b4e](https://github.com/happydesigns/nuxt-variants/commit/98e6b4e))
- **devtools:** Follow the current route variant ([067da11](https://github.com/happydesigns/nuxt-variants/commit/067da11))
- **devtools:** Refresh app config snapshots ([8286878](https://github.com/happydesigns/nuxt-variants/commit/8286878))
- **validation:** ⚠️  Reject unknown variant fields ([3b71b4e](https://github.com/happydesigns/nuxt-variants/commit/3b71b4e))
- **devtools:** Compact the mobile variant picker ([07275fd](https://github.com/happydesigns/nuxt-variants/commit/07275fd))
- **validation:** ⚠️  Diagnose malformed registry entries ([dac95ec](https://github.com/happydesigns/nuxt-variants/commit/dac95ec))
- **devtools:** Copy resolved inspector output ([8650d52](https://github.com/happydesigns/nuxt-variants/commit/8650d52))

### 🔥 Performance

- **runtime:** Compile variant resolution plans ([e5de4f7](https://github.com/happydesigns/nuxt-variants/commit/e5de4f7))
- **runtime:** Compile activity override plans ([8afd5b6](https://github.com/happydesigns/nuxt-variants/commit/8afd5b6))
- **build:** Avoid duplicate client prepare ([889bf0d](https://github.com/happydesigns/nuxt-variants/commit/889bf0d))
- **runtime:** Resolve only the selected override lineage ([8903e7a](https://github.com/happydesigns/nuxt-variants/commit/8903e7a))

### 🩹 Fixes

- **release:** Ensure npm authentication ([5daef44](https://github.com/happydesigns/nuxt-variants/commit/5daef44))
- **types:** Align published module contracts ([cbdf736](https://github.com/happydesigns/nuxt-variants/commit/cbdf736))
- **devtools:** Support custom app base URLs ([43abf80](https://github.com/happydesigns/nuxt-variants/commit/43abf80))
- **schemas:** Make validator peers truly optional ([41ef3ed](https://github.com/happydesigns/nuxt-variants/commit/41ef3ed))
- **devtools:** Tolerate standalone inspector access ([f32ea8c](https://github.com/happydesigns/nuxt-variants/commit/f32ea8c))
- **types:** Normalize generated runtime config boundary ([fda47d0](https://github.com/happydesigns/nuxt-variants/commit/fda47d0))
- **devtools:** Share normalized inspector contracts ([b8c40e7](https://github.com/happydesigns/nuxt-variants/commit/b8c40e7))
- **docs:** Bundle lucide icons locally ([f199b8f](https://github.com/happydesigns/nuxt-variants/commit/f199b8f))
- **types:** Derive variants from merged app config ([22e6673](https://github.com/happydesigns/nuxt-variants/commit/22e6673))

### 💅 Refactors

- **module:** ⚠️  Narrow the auto-import surface ([5837ce3](https://github.com/happydesigns/nuxt-variants/commit/5837ce3))
- **schemas:** ⚠️  Remove the virtual schema facade ([f5d7262](https://github.com/happydesigns/nuxt-variants/commit/f5d7262))
- **types:** ⚠️  Expose immutable graph contracts ([9ab0e1c](https://github.com/happydesigns/nuxt-variants/commit/9ab0e1c))

### 📖 Documentation

- Define the 1.0 architecture contracts ([cacafa0](https://github.com/happydesigns/nuxt-variants/commit/cacafa0))
- Align guides with the 1.0 contracts ([ae3fa8f](https://github.com/happydesigns/nuxt-variants/commit/ae3fa8f))
- **core:** Clarify variant list structure ([e463baa](https://github.com/happydesigns/nuxt-variants/commit/e463baa))
- **package:** Improve npm discoverability ([e80a971](https://github.com/happydesigns/nuxt-variants/commit/e80a971))
- **package:** Include MIT license ([28db45b](https://github.com/happydesigns/nuxt-variants/commit/28db45b))

### ✅ Tests

- **layers:** Verify registry composition ([1b98c93](https://github.com/happydesigns/nuxt-variants/commit/1b98c93))
- **core:** Cover layer overrides and startup failures ([4532c6d](https://github.com/happydesigns/nuxt-variants/commit/4532c6d))
- **perf:** Expose resolution benchmarks ([1f5369c](https://github.com/happydesigns/nuxt-variants/commit/1f5369c))

### 🤖 CI

- Make validation installs reproducible ([3ff713a](https://github.com/happydesigns/nuxt-variants/commit/3ff713a))

#### ⚠️ Breaking Changes

- **core:** ⚠️  Separate structural and runtime variants ([b10263f](https://github.com/happydesigns/nuxt-variants/commit/b10263f))
- **types:** ⚠️  Strengthen runtime variant contracts ([fac94af](https://github.com/happydesigns/nuxt-variants/commit/fac94af))
- **validation:** ⚠️  Reject unknown variant fields ([3b71b4e](https://github.com/happydesigns/nuxt-variants/commit/3b71b4e))
- **validation:** ⚠️  Diagnose malformed registry entries ([dac95ec](https://github.com/happydesigns/nuxt-variants/commit/dac95ec))
- **module:** ⚠️  Narrow the auto-import surface ([5837ce3](https://github.com/happydesigns/nuxt-variants/commit/5837ce3))
- **schemas:** ⚠️  Remove the virtual schema facade ([f5d7262](https://github.com/happydesigns/nuxt-variants/commit/f5d7262))
- **types:** ⚠️  Expose immutable graph contracts ([9ab0e1c](https://github.com/happydesigns/nuxt-variants/commit/9ab0e1c))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.1.1

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- **types:** Support explicit variant config overrides ([9590cf4](https://github.com/happydesigns/nuxt-variants/commit/9590cf4))
- **schemas:** Add bound variant schema resolver ([18cedaa](https://github.com/happydesigns/nuxt-variants/commit/18cedaa))

### 📖 Documentation

- Align guides with current public contracts ([9ad2a5d](https://github.com/happydesigns/nuxt-variants/commit/9ad2a5d))
- Explain variants through real ui patterns ([c9d2230](https://github.com/happydesigns/nuxt-variants/commit/c9d2230))

### 🏡 Chore

- Lint ([30ef51c](https://github.com/happydesigns/nuxt-variants/commit/30ef51c))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.1.0

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.0.6...v0.1.0)

### 🚀 Enhancements

- **schemas:** Create graphs from shared registries ([5c1f4a1](https://github.com/happydesigns/nuxt-variants/commit/5c1f4a1))

### 🔥 Performance

- **runtime:** Reuse resolved variant feature sets ([f5f0972](https://github.com/happydesigns/nuxt-variants/commit/f5f0972))

### 🩹 Fixes

- **types:** Preserve dynamic variant config fields ([3050b35](https://github.com/happydesigns/nuxt-variants/commit/3050b35))
- **runtime:** Preserve feature resolution order ([f68a95f](https://github.com/happydesigns/nuxt-variants/commit/f68a95f))
- **schemas:** Normalize empty variant entries ([19c913e](https://github.com/happydesigns/nuxt-variants/commit/19c913e))
- **errors:** Use the nuxt-variants package name ([47a7764](https://github.com/happydesigns/nuxt-variants/commit/47a7764))
- **build:** Prepare devtools client before generation ([b41e4f0](https://github.com/happydesigns/nuxt-variants/commit/b41e4f0))

### 💅 Refactors

- **schemas:** ⚠️ Require explicit variant graphs ([5498f3b](https://github.com/happydesigns/nuxt-variants/commit/5498f3b))
- **core:** Share variant graph normalization ([00ed14b](https://github.com/happydesigns/nuxt-variants/commit/00ed14b))

### 📖 Documentation

- Document the 0.1 migration ([b93ff3b](https://github.com/happydesigns/nuxt-variants/commit/b93ff3b))
- **playground:** Show explicit schema graph usage ([7fa26b7](https://github.com/happydesigns/nuxt-variants/commit/7fa26b7))

### 🏡 Chore

- **deps:** ⚠️ Require supported Node releases ([5c824fa](https://github.com/happydesigns/nuxt-variants/commit/5c824fa))

### 🤖 CI

- Use dev prepare script ([26b6972](https://github.com/happydesigns/nuxt-variants/commit/26b6972))
- Test Nuxt 4.5 on Node 24 ([b41b124](https://github.com/happydesigns/nuxt-variants/commit/b41b124))
- Update GitHub Actions ([a178ba8](https://github.com/happydesigns/nuxt-variants/commit/a178ba8))

#### ⚠️ Breaking Changes

- **schemas:** ⚠️ Require explicit variant graphs ([5498f3b](https://github.com/happydesigns/nuxt-variants/commit/5498f3b))
- **deps:** ⚠️ Require supported Node releases ([5c824fa](https://github.com/happydesigns/nuxt-variants/commit/5c824fa))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

## v0.0.6

[compare changes](https://github.com/happydesigns/nuxt-variants/compare/v0.0.5...v0.0.6)

### 🚀 Enhancements

- **types:** Expose all registry keys on AnyVariantConfig for unknown-key useVariant calls ([0b1fb0b](https://github.com/happydesigns/nuxt-variants/commit/0b1fb0b))
- Add variant diagnostics ([b8087b5](https://github.com/happydesigns/nuxt-variants/commit/b8087b5))
- Add nuxt variants devtools ([e22e489](https://github.com/happydesigns/nuxt-variants/commit/e22e489))

### 🩹 Fixes

- **types:** Make mergeVariantSchemas return concrete schema type via overloads ([dc9b474](https://github.com/happydesigns/nuxt-variants/commit/dc9b474))
- **types:** Infer variant registry intersections ([39a1a8f](https://github.com/happydesigns/nuxt-variants/commit/39a1a8f))
- Merge generated app variant types ([cd2010d](https://github.com/happydesigns/nuxt-variants/commit/cd2010d))
- Avoid variant definition auto-import collision ([63c2329](https://github.com/happydesigns/nuxt-variants/commit/63c2329))
- Redirect stale docs playground routes ([e8a3f05](https://github.com/happydesigns/nuxt-variants/commit/e8a3f05))
- Serve devtools from client app ([b521b59](https://github.com/happydesigns/nuxt-variants/commit/b521b59))
- Convert devtools client to nuxt app ([29b6e7c](https://github.com/happydesigns/nuxt-variants/commit/29b6e7c))
- Accept inactive variant option type ([04d279f](https://github.com/happydesigns/nuxt-variants/commit/04d279f))
- Keep docs code tree layout aligned ([ee572ad](https://github.com/happydesigns/nuxt-variants/commit/ee572ad))
- Add docs type project ([77b18a3](https://github.com/happydesigns/nuxt-variants/commit/77b18a3))
- **types:** Include known variant config fields ([361b403](https://github.com/happydesigns/nuxt-variants/commit/361b403))

### 💅 Refactors

- Centralize variant resolution ([f89b8b1](https://github.com/happydesigns/nuxt-variants/commit/f89b8b1))
- Split devtools client components ([38cfbbf](https://github.com/happydesigns/nuxt-variants/commit/38cfbbf))
- Align devtools client with ui kit ([c19222a](https://github.com/happydesigns/nuxt-variants/commit/c19222a))
- Simplify devtools variant layout ([4a15bde](https://github.com/happydesigns/nuxt-variants/commit/4a15bde))
- Clarify devtools inspector ui ([01768f0](https://github.com/happydesigns/nuxt-variants/commit/01768f0))
- Clarify devtools feature terminology ([92a0cff](https://github.com/happydesigns/nuxt-variants/commit/92a0cff))
- Simplify devtools composition view ([824573d](https://github.com/happydesigns/nuxt-variants/commit/824573d))
- Use extends terminology in devtools ([8da181d](https://github.com/happydesigns/nuxt-variants/commit/8da181d))

### 📖 Documentation

- **readme:** Fix Nuxt badge ([5f51b83](https://github.com/happydesigns/nuxt-variants/commit/5f51b83))
- Add agent workflow template ([b7803e2](https://github.com/happydesigns/nuxt-variants/commit/b7803e2))
- Add docus site ([8098ffa](https://github.com/happydesigns/nuxt-variants/commit/8098ffa))
- Fix docus rendering ([0f7791f](https://github.com/happydesigns/nuxt-variants/commit/0f7791f))
- Improve docus landing ([fd16788](https://github.com/happydesigns/nuxt-variants/commit/fd16788))
- Clarify installation examples ([d625308](https://github.com/happydesigns/nuxt-variants/commit/d625308))
- Polish playground examples ([350f1bc](https://github.com/happydesigns/nuxt-variants/commit/350f1bc))
- Refresh readme overview ([22d58fd](https://github.com/happydesigns/nuxt-variants/commit/22d58fd))
- Document diagnostics and inactive variants ([838da6e](https://github.com/happydesigns/nuxt-variants/commit/838da6e))
- Document devtools inspector ([1f761d6](https://github.com/happydesigns/nuxt-variants/commit/1f761d6))
- Polish landing page ([a643851](https://github.com/happydesigns/nuxt-variants/commit/a643851))
- Redesign landing page ([b47249a](https://github.com/happydesigns/nuxt-variants/commit/b47249a))
- Use nuxt ui landing primitives ([138775e](https://github.com/happydesigns/nuxt-variants/commit/138775e))
- Polish landing hero workbench ([5b4bef8](https://github.com/happydesigns/nuxt-variants/commit/5b4bef8))
- Move landing content into markdown ([e6eb5ff](https://github.com/happydesigns/nuxt-variants/commit/e6eb5ff))
- Remove agent workflow references ([ca394f7](https://github.com/happydesigns/nuxt-variants/commit/ca394f7))
- Polish landing page ([b3ccdf0](https://github.com/happydesigns/nuxt-variants/commit/b3ccdf0))
- Clarify variant feature checks ([1bba84b](https://github.com/happydesigns/nuxt-variants/commit/1bba84b))

### 🏡 Chore

- Rename package from @h4designs/nuxt-variants to @happydesigns/nuxt-variants ([8042102](https://github.com/happydesigns/nuxt-variants/commit/8042102))
- Ignore docus content formatting ([80fa8df](https://github.com/happydesigns/nuxt-variants/commit/80fa8df))
- Remove unused runtime plugin ([2b605c8](https://github.com/happydesigns/nuxt-variants/commit/2b605c8))
- Exclude docs from root typecheck ([11d6819](https://github.com/happydesigns/nuxt-variants/commit/11d6819))
- Update next improvement track ([a7d4383](https://github.com/happydesigns/nuxt-variants/commit/a7d4383))
- Quiet docs dependency prebundle warning ([c93cd23](https://github.com/happydesigns/nuxt-variants/commit/c93cd23))
- Make lint check only ([dae51a4](https://github.com/happydesigns/nuxt-variants/commit/dae51a4))
- Enforce lf line endings ([d735099](https://github.com/happydesigns/nuxt-variants/commit/d735099))
- Remove .agents folder ([7dfc269](https://github.com/happydesigns/nuxt-variants/commit/7dfc269))
- Fix release package lifecycle ([63a2c1e](https://github.com/happydesigns/nuxt-variants/commit/63a2c1e))

### ✅ Tests

- Expand variant coverage ([576147e](https://github.com/happydesigns/nuxt-variants/commit/576147e))

### 🎨 Styles

- Format schema overloads ([f3bccb0](https://github.com/happydesigns/nuxt-variants/commit/f3bccb0))

### 🤖 CI

- Pin pnpm version ([9031500](https://github.com/happydesigns/nuxt-variants/commit/9031500))
- Align workflow with node 22 ([3cf2bb1](https://github.com/happydesigns/nuxt-variants/commit/3cf2bb1))

### ❤️ Contributors

- Jan Fröhlich ([@janfrl](https://github.com/janfrl))

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
