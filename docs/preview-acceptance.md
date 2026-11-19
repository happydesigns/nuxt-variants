# Composable Variants acceptance

This report compares Composable Variants on `codex/comark-devframe-preview`
with the released `0.2.0`. The comparison uses the release's resolver and
integrity-checked inspector.

## 0.3.0-rc.1 acceptance

The local tarball built from `5aba1f0` keeps the package name
`@happydesigns/nuxt-variants`. Composable Variants is the product name.
The same tarball went into an isolated package consumer and the Course app.

| Check                  | Result                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository and package | Lint, module, Playground and Inspector types, and all 144 tests passed. The isolated consumer imported the portable core without optional peers and verified Content type generation and offline DevFrame assets.                                                                                                                                                                               |
| Playground and Docus   | Both production builds and the Docus typecheck passed. Article and Event switched by keyboard at 1440 and 390 px. The primary action measured 7.13:1 in the light desktop theme and 10.02:1 in the dark mobile theme. The tested Docus link measured 7.61:1.                                                                                                                                    |
| Inspector              | The comparison opened the 0.2.0 JSON inspector, live DevFrame and a recorded snapshot. Keyboard filtering, override provenance, refresh after a TOC change and the mobile field link passed.                                                                                                                                                                                                    |
| Course                 | Both production builds prerendered 49 routes. The candidate snapshot preserved the paths, frontmatter and render nodes of all 11 documents and stored the `course` identity. Both checkpoint states survived upgrade and rollback on desktop and mobile. The read-only inspector traced `storagePrefix` to the `courseProgress` app override in both the live JSON and recorded DevFrame views. |

The Course host registered the **Composable Variants** iframe under the
Nuxt group. The registered snapshot query returned 28 variants, including
the `cp18-progress` override. The iframe URL and its client entry both
returned HTTP 200. The browser reached the native dock's authorization
prompt. Opening the Inspector from inside that dock requires the local
host's approval.

The [Nuxt Content release list](https://github.com/nuxt/content/releases)
still lists 3.17.0 as latest on 19 November 2026. A v4 wrapper test needs
an installable build.

The RC tarball is 422,548 bytes compressed and 1,509,783 bytes unpacked.
The initial inspector HTML references 203,145 bytes of gzipped scripts
and styles, including preloads, compared with 62,035 bytes in 0.2.0.
Those assets are used by the development inspector. On the measured
production Course page, both builds loaded 67 JavaScript and three CSS
resources. The RC transferred 64 more uncompressed JavaScript bytes
and the same CSS. Both builds returned HTTP 404 for the inspector endpoint.

The six existing peer dependency warnings remain. The final test run
used one worker after the compiler test exceeded its timeout during a
concurrent documentation build.

## Adoption decision

Use the Nuxt adapter for applications that compose capabilities across layers.
Course is the first adoption candidate. Its reader consumes nine features.
Changing one inherited setting takes one app-config edit in either version.
The new inspector identifies the winning input directly, and the learner's
saved checkpoint survives both upgrade and rollback. See the
[Course pilot](./course-pilot.md) for the real consumer and reproduction steps.

Keep a single distribution with optional `/core`, `/content` and `/devtools`
entry points. A standalone consumer can resolve plain data without loading Nuxt,
Vue, Comark or DevFrame. Installing the package still brings its declared Nuxt
tooling dependencies. Revisit packaging when another consumer needs to avoid
that installation or needs a different release cycle.

A separate architecture review via the Claude CLI (Fable 5.2) reached the
same recommendation from a short design summary. Its release criterion for
Nuxt Content v4 was a real identity round trip on the wrapper.

## What to compare locally

Run `pnpm compare:prepare` and `pnpm compare`, then open
[the comparison](http://127.0.0.1:4192/). Select **event**, change the TOC
setting and compare the release, live and offline inspectors. The offline
snapshot shows the state at server startup. Select **event** in the live
inspector. Under **Fields**, `header.title` comes from the header registry
default and `label` from the event app override. **Composition** links to
contributing variants in resolution order. **Configuration** provides the
effective configuration and variant inputs for copying.

The panel follows the Nuxt UI dashboard group, sidebar, panel and navbar
composition. The detail view starts with the variant composition, then
shows fields and configuration. The field table keeps native headers and
stacks rows at narrow panel widths. It initially renders up to 40 values
and formats more on request. The configuration code group displays one
view at a time.
Route-only notifications preserve the resolved registry. Refresh preserves
a manually selected variant. See the [Nuxt UI dashboard](https://ui.nuxt.com/docs/components/dashboard-group) and
[design system](https://ui.nuxt.com/docs/getting-started/theme/design-system).

## Preview checks on 18 November 2026

| Criterion                    | Result                                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install, types and packaging | Frozen pnpm install, module/playground/inspector typechecks, separate Docus typecheck and isolated tarball consumer passed. The pack test verifies actual boot HTML and a loadable relative JS entry in the offline copy.       |
| Correctness                  | All 139 repository tests in 18 files passed with Vitest 5.1.0 and one worker.                                                                                                                                                   |
| Development hosts            | The real Nuxt DevTools 4.2 dock selected Article automatically, updated its fields when TOC was disabled and followed navigation to Event. The release, standalone live and offline panels all rendered in the comparison.      |
| Interaction                  | Keyboard variant search and selection, tab traversal, parent navigation and direct field provenance checked. At 390 px, selection returned focus to the sidebar button. At 320 px the document width and content width matched. |
| Production                   | Five playground routes returned 200. Inspector and snapshot routes returned 404. Inspector protocol strings were absent from the production assets.                                                                             |
| Documentation                | Docus production build passed. In the served page, choosing Summary and changing the delimiter updated the real resolved data. The guide links and runnable examples were also checked.                                         |

With a 1,000-field snapshot the inspector initially mounted 40 data rows.
**Show more** mounted the next 40, and searching immediately found the final
field. A simulated HTTP 503 displayed **Retry** and recovered in place.

In the final Course snapshot, ten measurements covered the active tab,
selected variant, override text and hover states in both themes. The lowest
text contrast was 5.81:1 on light surfaces and 6.58:1 on dark surfaces.
The initial light palette fell to 2.20:1 on the selected variant. The
[local read-only Course inspector](http://127.0.0.1:4197/?transport=devframe)
contains the 28 host variants. Select **course** and search for
`storagePrefix` to see the Course override.

An isolated Nuxt 4.5.0 consumer, the module's declared minimum, rendered
an inherited value into generated HTML using the packed adapter.

The final tarball measured 245,981 bytes compressed and 906,606 bytes unpacked.
In the inspector HTML, initial scripts and styles (including preloads, excluding
prefetches) measured 178,949 bytes gzipped, down from 185,314 in the preceding
preview. The released inspector measured 62,035 bytes by the same method.
This is a development-tool cost. For measurements from the actual deployed
reader build, see the [Course pilot](./course-pilot.md).

## Core correctness and cost

- A release comparison covered the 19 UI and nine Course names with the
  actual app defaults and each feature disabled in turn. Config and ordered
  features matched in all 470 cases. Comparing the optimized portable branch
  against `d08dbcb` reproduced these 470 results and a further 600 synthetic
  chain cases, including active status.
- One upgrade difference predates this branch. In a diamond, the first parent
  overrides a shared base and the later parent inherits it. The release picks
  the first override. The preview picks the later parent's inherited value,
  following the precedence fix already on `main` at `489e481`.
- The resolver caches one default result per name actually requested. Each
  caller receives independent data. Calls supplying overrides resolve afresh.
  The portable types handle optional, widened and union parents and app
  defaults. On a 24-node shared-ancestor graph, TypeScript 6.0.2 reported
  8,065 instantiations after the change and 103,732 before it.
- Local median time per warm call, including the returned copy, went from
  16.41 to 7.53 µs for alternating article/event, 11.86 to 7.61 µs for Course
  and 35.18 to 6.02 µs for a 24-entry chain. Both portable versions used the
  same process and inputs, 250 warmups and nine batches of 2,000 calls. These
  figures measure repeated resolver calls. They do not measure reader latency.
- On the final packaged build, `pnpm bench` completed 11 measurements. The
  warm portable resolution for the 24-entry chain had a median of 2.5 µs.
  The Nuxt compiled-config path measured 18.2 µs. Only the portable path
  reuses the complete result for a previously requested default config.

## Dependency policy for this candidate

All direct dependencies now declare compatible semver ranges. The exact
package manager is pnpm 12.21.0, and the lockfile records the tested workspace.
Nuxt/Kit/Schema use 4.6.4, Nuxt UI 4.12.2, Vue 3.5.45 and Vitest/Coverage
5.1.0. TypeScript 6.0.3 provides the compiler API used in tests and the
comparison. Testing TypeScript 7.0.2 reproduced missing compiler functions
and a `vue-tsc` startup failure. Node types follow the lowest supported
Node major, 22. Docus uses its supported SQLite 12.x driver, the playground
uses 13.x. Package age policy left Nuxt Content 3.16.2 and Lucide 1.2.155
in the lockfile at the time of acceptance. See
[pnpm's minimum release age](https://pnpm.io/supply-chain-security).

`pnpm peers check` still reports six upstream-tooling conflicts. Vue
DevTools and Unhead request an older Vite DevTools range. Two Nuxt Kit
dependency trees supply older oxc-parser and unplugin peers for unctx.
Module Builder and unbuild declare TypeScript 5.9 peers, and mkdist requests
an older vue-sfc-transformer. The candidate passed the builds and tests
with those warnings visible.

## Where typed presets suffice

`pnpm compare:presets ../ui` compares typed feature arrays with the Comark
adapter on eight articles and four events. Both use the same field validators.
Changing the shared category rule took one edit either way. Filtered SQLite
results and all 24 document/schema HTML renderings agreed. Fixed collections
like these can use typed presets. Dynamic activation, inheritance across layers
and explaining the effective config justify using the resolver.

For the UI playground's standalone user collection, both approaches agreed on
parsed values or issue paths/messages in five cases. Its seven fields have no
inheritance to simplify. Course actions are a different case. All five action
schemas reject an extra field in the domain's strict discriminated union.
Copying fields into a new schema strips that field. Keep the domain validator
when strictness or object-level refinements are part of the contract.

## Compatibility boundaries

- Course's local upgrade from Comark Content 0.4.1 to 0.6.2 enables
  `/content`. The packed adapter preserved all 11 Course documents in a
  snapshot round trip and generated the nine registry names for both data
  and queries. [Course upgrade and reproduction](./course-pilot.md#content-adapter-on-the-upgraded-course-reader)
- On 18 November 2026, npm's latest Nuxt Content was 3.17.0. Nuxt Content v4
  is planned to use Comark Content. Verify the wrapper with a real file,
  generated type and identity round trip once it is available.
  [Upstream design discussion](https://github.com/nuxt/content/discussions/3776)
- The portable adapter supports one top-level selector, plain-data resolver
  configuration and literal-name type generation. Keep Studio editing,
  schema refinements and application layout policy in their owning tools.
