# Platform preview acceptance

Local preview `0.3.0-next.0`, reviewed on 17 November 2026 on
`codex/comark-devframe-preview`, based on `626806d`. The visual comparison
uses the released `v0.2.0` resolver and its integrity-checked published UI.
Nothing was pushed or published, and no productive consumer was migrated.

## Decision

Keep one package for now. The optional `/core`, `/content`, and `/devtools`
entries share the existing resolution rules. Nuxt remains an adapter, while
Comark Content owns document identity and DevFrame owns inspector transport.
The existing Nuxt composable and schema contracts stay in place; the native
DevFrame dock is opt-in. A separate package becomes useful when an actual
non-Nuxt consumer needs an independent dependency or release lifecycle.

The inspector now uses Nuxt UI 4.10 primitives and semantic theme tokens.
Its domain layout, compact mobile selector, and JSON visualization remain
custom. This is an implementation choice, not a claim of formal Nuxt UI or
accessibility certification.

## Completed checks

| Check                                  | Result                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen workspace installation          | Passed without changing the lockfile                                                                                                         |
| Quality checks                         | Formatting, lint and module/playground/client typechecks passed; final full suite: 131 tests passed with `vitest run --maxWorkers=1`         |
| `pnpm prepack` and `pnpm test:package` | Real tarball, isolated consumer, packed types, Content typegen and offline assets passed                                                     |
| Core import isolation                  | Resolution works without Nuxt, Vue, Content or DevFrame installed in the consumer                                                            |
| Consumer resolution shadows            | 70 cases across the actual UI and Course registries/defaults; config and features equal                                                      |
| Diagnostic parity                      | 1,536 cases against `626806d`; exact diagnostic arrays and order equal                                                                       |
| Production and docs builds             | Both passed with Nuxt 4.5.1, Vue 3.5.44 and Vite 8.3.8                                                                                       |
| Production HTTP                        | `/`, `/article`, `/event`, `/landing`, `/blog` returned 200; inspector and snapshot routes returned 404                                      |
| Documentation HTTP                     | Built documentation home and `/docs/platform-preview` returned 200                                                                           |
| Production output inspection           | New host-channel and snapshot-protocol strings absent                                                                                        |
| Native Nuxt DevTools 4.2               | Article selected automatically; disabling TOC updated features/config immediately; navigation selected Event without reopening the inspector |
| Comparison browser flows               | Article, snippet, course and disabled capabilities remained equivalent; actual released UI, live UI and offline UI loaded                    |
| Inspector interaction                  | Keyboard selection, name filtering, JSON copy, visible disconnect state and Retry recovery without page reload passed                        |
| Responsive inspector                   | Desktop and 390 x 844 viewport inspected; compact selection worked, with no document-level horizontal overflow                               |

The native Nuxt test host was stopped after acceptance. The artificial
comparison can remain available on loopback ports 4192/4193. It changes
only its in-memory fixture state. Its offline view intentionally preserves
the startup snapshot.

One concurrent docs-build/test run exceeded the existing five-second limit in
three compiler tests. The unchanged suite passed with one worker in 89 seconds;
no assertions or time limits were relaxed. A full `pnpm check` had also passed
before the final dependency-resolution cleanup.

The tarball is approximately 209 kB compressed and 769 kB unpacked.
Core imports do not load the platform peers, but installing this combined
package still installs its declared Nuxt tooling dependencies.
The workspace explicitly pins the matching Vite DevTools kit for build types;
Nuxt DevTools kit 4.2 references those types without declaring the dependency.
This prevents an older hoisted kit from silently controlling compilation.
Documentation pins Docus 5.15.0. Rechecking 5.12.3 with the new toolchain
exposed unresolved nested module dependencies (UI color mode/fonts and robots'
site config). The accepted newer Docus version avoids adding workspace-only
dependency workarounds for those modules.

## Performance

`pnpm bench` passed. For the 24-entry chain fixture, the existing compiled
config path averaged about 0.050 ms and the portable path about 0.073 ms
including validation and isolated output copies: approximately 1.45 times
the cost. Relative error was about 9% and 5%, respectively. This is a local
microbenchmark, not application latency evidence or a speed improvement.

Compile the immutable resolver once per content/application instance. Keep
snapshots identity-only and resolve current overrides when needed. The Nuxt
path retains its existing compiled plans. Inspector refresh has no polling;
the Nuxt page sends scoped change notifications and closes its channel on
teardown. No additional cache or worker layer is justified by this evidence.

## Limits before release or adoption

- Comark Content 0.6.2 is tested. Nuxt Content v4 remains an integration
  target; its final wrapper contract has not been accepted here.
- The extension supports one top-level selector, plain-data resolver config,
  and literal-name type generation. It does not replace application domain
  schemas, refinements, or the existing Zod/Valibot schema helpers.
- Resolution shadows do not prove a productive application's collection
  schemas, SSR, content queries or complete browser migration.
- Nuxt DevTools 4.2 requests `@vitejs/devtools ^0.8`, while the inspected
  Vue DevTools v9 prereleases declare `^0.7.x`. The tested Variants dock works,
  but that upstream prerelease peer mismatch remains. No forced peer override
  was added. Existing tooling/TypeScript and Content/SQLite peer warnings also
  remain outside this preview's scope.
- Builds emit upstream export-pattern, annotation, MDC optimizer and image
  external-import warnings. Successful builds do not establish every Docus
  image route or unrelated DevTools panel as accepted.

## Next steps

1. Review the local comparison with `pnpm compare:prepare` and `pnpm compare`.
   Decide whether the reduced coupling and inspector information are useful.
2. Pilot the optional Content entry in one isolated consumer checkout, with
   its real schemas, generated types, queries and SSR/browser flows. Keep the
   productive application on its current module until that acceptance passes.
3. Verify the actual Nuxt Content v4 adapter contract and resolve the upstream
   DevTools peer matrix before a stable release. Keep the opt-in preview until
   those checks are complete.
4. Consider upstream contributions only for generic semantic-field/typegen
   gaps demonstrated by the pilot. Variant composition and application layout
   policy belong in this extension unless multiple upstream users need them.
