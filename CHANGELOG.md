# Changelog

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
