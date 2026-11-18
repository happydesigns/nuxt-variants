# Course reader upgrade pilot

Course can keep its existing variant registry, reader and stored checkpoints
when trying the Composable Variants preview. The setting took one app-config
edit with either version. The preview's practical benefit here is tracing an
inherited value to the app override that supplied it.

## Comparison

The pilot used two clean exports of Course commit
`e2873a31e61093e19e8213849327ff272329e6d0`, with Nuxt 4.6.2 and
Comark Content 0.4.1. The baseline installed Variants 0.2.0 from Course's
frozen lockfile. The candidate installed a local 0.3.0-next.1 tarball
(SHA-256 `bfd9293d23209d152d65053de83d79fa09d957d56d4b4da76d90164016dfa3e8`).

| In the running Course app                                                 | Released integration                                                                         | Preview                                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Type of `useVariant('course').config.value.courseProgress?.storagePrefix` | `string \| undefined`, checked with the generated app types                                  | Same                                                            |
| Getting Started lesson                                                    | Server rendered the checkpoint. Clicking it saved progress under the configured key.         | Same                                                            |
| Existing learner progress                                                 | A checkpoint set on 0.2.0 was checked after upgrading on the same origin                     | Unchecking it persisted when switching back to 0.2.0            |
| Origin of the configured prefix                                           | Final config shows the value. Finding its owner requires checking individual variant inputs. | The field identifies `courseProgress` and `App config override` |
| Static Course build                                                       | 49 prerendered routes, 11 source documents verified                                          | Same                                                            |

Both browser sizes (1440 and 390 pixels) completed the upgrade and rollback.
The default `course-progress:abap-platform-rap120` key stayed absent. The
static builds served the lesson with HTTP 200 and the inspector data route
with HTTP 404. The browser recorded no page errors in the progress flow.

Course's 12 existing browser tests passed on each build with the expected
storage key adjusted to the pilot prefix. The preview also passed Course's
113 CLI, reader-layer and playground tests.

On a fresh desktop visit to the production lesson, each version loaded 67
JavaScript and three CSS resources from `/course/_nuxt/`. After hydration
and network idle, the uncompressed JavaScript response bodies totaled
1,162,886 bytes on the release and 1,162,950 on the preview. CSS totaled
249,141 bytes on both. This measures the first-load assets for this lesson.

The filtered field stayed visible at both browser sizes. The active tab and
the override label had text contrast ratios of 7.61:1 in light mode and
9.14:1 in dark mode. Across the selected variant, active tab and their
hover states, the lowest ratios were 5.81:1 and 6.58:1 respectively, both
on the hovered selected variant. Measurements used the rendered colors
after CSS transitions finished.

## Reproduce the check

1. Export that Course commit into two directories outside any parent
   JavaScript workspace. For the release, run `pnpm install --frozen-lockfile`.
   For the preview, set a pnpm override for `@happydesigns/nuxt-variants` to
   the packed tarball and install. Keep each app's generated files separate.
2. Add the following setting to `playground/app/app.config.ts` in both copies.

   ```ts
   variants: {
     courseProgress: {
       config: { courseProgress: { storagePrefix: 'cp18-progress' } },
     },
   },
   ```

3. For development, run `pnpm exec nuxt prepare` in `packages/nuxt`, then
   start the playground. Open `/courses/abap-platform-rap120/getting-started`
   and check the Group ID checkpoint. Reload and confirm that it remains
   checked. The browser entry is `cp18-progress:abap-platform-rap120`.
4. For the source inspection, enable Nuxt DevTools in the playground. The
   baseline used its locked 3.4.4 host. The preview used a pnpm override
   for `@nuxt/devtools` 4.2.0, a playground dev dependency on `devframe`
   1.3.5, and `variants: { devtools: 'devframe' }`. Open the inspector's
   local `/__nuxt-variants/devtools/?transport=legacy` URL and select `course`
   to inspect `courseProgress.storagePrefix`. In the preview, Fields opens
   first and shows the value, variant and app override together. Use the
   sidebar menu on small screens. The field search, Composition and JSON
   tabs were also exercised with this Course registry. The Course reader selects this
   variant in its composable; its route does not declare a variant in page
   metadata.
5. For the upgrade test, build each playground with `NITRO_PRESET=github_pages`,
   `NUXT_APP_BASE_URL=/course/` and `pnpm --filter @happydesigns/course-playground build`.
   Serve both static outputs successively from the **same origin** at `/course/`.
   Check the checkpoint on the release, reload onto the preview and uncheck it.
   Switch back and reload to verify it is still unchecked.

## Adoption boundary

This action needs no reader or schema changes. Keeping the existing prefix
preserves the learner's data across versions. Deliberately changing the prefix
selects a different browser-storage namespace.

The Course inspection used the real Nuxt JSON snapshot. In a fresh browser,
the regular Nuxt DevTools dock showed “Nicht autorisiert” after opening it
with Shift+Alt+D. The same host's connection descriptor returned HTTP 200.
For read-only review, DevFrame's `createBuild` also recorded the Course
response with the standard `nuxt-variants:get-snapshot` RPC. The static
inspector loaded all 28 variants and displayed the Course field's source
without a live Course server or host authorization.

The Nuxt adapter was exercised
with the Course lockfile's Comark Content 0.4.1. Using the optional `/content`
extension would require a separate upgrade. The 0.4.1 SDK lacks the runtime
`addFieldType` method and has an incompatible schema type. The Nuxt adapter
and `/core` work independently of this SDK. The DevTools 4 host also
has an unresolved Vite DevTools peer range in this consumer. These are
separate compatibility checks before adopting the whole preview stack.
