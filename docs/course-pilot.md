# Course upgrade and rollback

The Course pilot checked whether an existing reader could adopt Config Variants while preserving rendered content and saved checkpoints. The published baseline and the candidate used the same registry and application settings from Course revision `c381901`.

## Results

- Both builds prerendered 49 routes. All 11 documents retained their paths, frontmatter and render nodes. The candidate snapshot also stored the selected `course` variant, which was available without the Markdown parser.
- The same-origin upgrade and rollback preserved the checked and unchecked Group ID checkpoint on desktop and mobile.
- The inspector traced `courseProgress.storagePrefix` to the `courseProgress` app config override. The production inspector route returned HTTP 404.

These results describe the pilot artifacts. Use both current builds when repeating the comparison.

## Reproduce

1. Use two clean Course checkouts at the same revision. Install the baseline from its frozen lockfile. Install the packed candidate in the other copy using the [migration guide](./content/docs/9.migration-0-3.md).
2. Set the same browser-storage prefix in both copies of `playground/app/app.config.ts`.

   ```ts
   variants: {
     courseProgress: {
       config: { courseProgress: { storagePrefix: 'cp18-progress' } },
     },
   },
   ```

3. In the candidate, use the existing Course registry when registering the Comark Content plugin in `packages/nuxt/preview/content.ts`.

   ```ts
   import { createVariantResolver } from "@happydesigns/config-variants";
   import { variantContent } from "@happydesigns/config-variants/comark-content";
   import { courseVariantRegistry } from "../schemas/variants";

   const resolver = createVariantResolver(courseVariantRegistry);
   const plugins = [variantContent({ resolver, defaultVariant: "course" })];
   ```

   Pass `plugins` to the existing `comarkContent` call. Keep `headingIds: "nested"` in Course's parser settings if existing lesson links depend on nested heading IDs.

4. Run `pnpm exec nuxt prepare` in each `packages/nuxt` directory. Build both playgrounds using Course's Pages preset and `/course/` base URL. Serve the static outputs in turn from the **same origin**. On `/course/courses/abap-platform-rap120/getting-started`, check Group ID in the baseline, uncheck it in the candidate, then verify the unchecked state after switching back. The storage key is `cp18-progress:abap-platform-rap120`.
5. In the candidate's development inspector, select `course` and look up `courseProgress.storagePrefix` under **Fields**.

Run the snapshot comparison from the built Config Variants checkout:

```sh
node examples/comparison/course-content.mjs /path/to/candidate-course \
  /path/to/baseline-course/playground/.output/public/api/course-preview/snapshot.json \
  --require-build-identity
```

The second argument supplies the baseline build's snapshot. The flag requires the candidate's built snapshot to contain the selected variant alongside the original paths, frontmatter and render nodes.
