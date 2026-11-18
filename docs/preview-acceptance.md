# Composable Variants preview acceptance

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
| Quality checks                         | Formatting, lint, module/playground/client typechecks and all 135 tests passed with a single test worker                                     |
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

The tarball with the field inspector is approximately 233 kB compressed and
857 kB unpacked.
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
config path averaged 0.0311 ms and the portable path averaged 0.0376 ms
including validation and isolated copies. The portable call took 1.21 times
as long in this run. Relative errors were 1.34% and 1.74%. These figures
measure isolated calls on the local machine.

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

## Follow-up review against the release

A direct check used the normalizer and compiled configuration path from the
`v0.2.0` Git tag and the built preview's `/core` entry. For each registry
name, it applied the consumer's own app defaults, then disabled each feature
individually. Config and ordered features matched in all 380 UI cases
(19 names × 20 settings) and 90 Course cases (9 names × 10 settings).
These checks cover resolution. The collection pilot below exercises the next
three boundaries independently.

One deliberate difference matters for upgrades. If two parents share a base
value, the first overrides it and the second inherits it, 0.2.0 returns the
first parent's override. The preview returns the second parent's inherited
value. Their feature lists are identical. The precedence fix already exists
on `main` at `489e481` and takes effect when upgrading from the release.

The portable resolver now infers typed application defaults supplied at
construction. An override that introduces a sibling's field fails typechecking,
including when passed as a variable. The Course-shaped contract reads inherited
`courseProgress.storagePrefix` and accounts for disabled parents and an inactive
root. A separate strict compile also passed with the actual Course registry
and app defaults. Registry config, defaults and overrides reject class
instances before copying. These changes apply to the optional entry.

## Article and event pilot

`pnpm compare:presets ../ui` reads the UI checkout's registry, Zod traits and
playground Markdown (tested at UI revision `f49467d`). One Comark instance
resolves the document through the extension. A second uses typed arrays of
features for each collection. Both
use the same field validators, including a shared change that trims category
text and rejects a blank category. Each approach needed one rule edit.

All eight articles and four events passed both schemas before and after that
change. Blank categories then failed in both collections, and malformed
authors and locations failed their respective collection checks. Filtered
SQLite queries agreed on published items in a selected category. The same Vue
reader produced identical HTML in all 24 document and schema combinations.
The fixture converts ISO date strings to Dates for the UI's existing Zod
schemas. Full Nuxt page rendering and Nuxt Content v4 remain separate checks.

For these two fixed collections, typed presets are sufficient. The graph earns
its place where a layer composes more capabilities, switches them at runtime
or needs to explain a resolved field. In the running Event example the new
field selector identifies `header.title` as a registry default from `header`
and `label` as an app-config override from `event`.

## Data records beyond pages

On 18 November 2026, the UI playground's `user` data collection resolved to
one feature and seven schema fields. The direct user schema and the composed
schema agreed on the parsed values or issue paths and messages in five sample
cases. Low-level Zod issue metadata differed between the two installed Zod
versions. This collection has no inheritance to simplify.

Course's `CourseActionSchema` uses a strict discriminated union for five
action types. For each type, the field schema composed with `/schemas`
accepted a valid record and rejected a record missing a required field.
When an unexpected field was added, the original union rejected the record
and the composed schema stripped the field in all five cases. Composition
copies object fields into a new schema. Keep strict record validation with
the domain schema when that behavior forms part of the data contract.

## Next steps

1. Pilot the packed preview in an isolated Course checkout. Change a real
   inherited setting such as `courseProgress.storagePrefix`, check the
   generated type, inspect the winning override and verify the reader's
   progress survives a reload under the configured key.
2. Compare that change with Course's existing integration. Record what the
   maintainer had to edit and whether the inspector explained the effective
   value. Use that result to decide on adoption. Keep simple data collections
   on their direct schemas.
3. Verify the actual Nuxt Content v4 adapter contract and resolve the upstream
   DevTools peer matrix before a stable release. Keep the opt-in preview until
   those checks are complete.
4. Consider upstream contributions only for generic semantic-field/typegen
   gaps demonstrated by the pilot. Variant composition and application layout
   policy belong in this extension unless multiple upstream users need them.
