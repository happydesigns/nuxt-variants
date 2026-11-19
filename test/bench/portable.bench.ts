import { createRequire } from "node:module";
import { test } from "vitest";
import type { VariantRegistry } from "../../src/runtime/utils/variants";

// Measure the packaged implementations without Vite's per-export getters.
const require = createRequire(import.meta.url);
const { createVariantResolver } =
  require("../../packages/composable-variants/dist/core.mjs") as typeof import("@happydesigns/composable-variants");
const { createVariantResolutionPlan, resolveVariantConfigFromPlan } =
  require("../../dist/runtime/utils/variants.js") as typeof import("../../src/runtime/utils/variants");
const registry: VariantRegistry = Object.fromEntries(
  Array.from({ length: 24 }, (_, i) => [
    `item-${i}`,
    { extends: i ? [`item-${i - 1}`] : [], config: { [`key${i}`]: i, links: [i] } },
  ]),
);
const resolver = createVariantResolver(registry);
const plan = createVariantResolutionPlan(registry);
test("existing Nuxt plan vs portable resolver (24 entries, same merge semantics)", async ({
  bench,
}) => {
  await bench.compare(
    bench("existing compiled config resolution", () => {
      resolveVariantConfigFromPlan("item-23", registry, {}, plan);
    }),
    bench("portable resolution including isolated output", () => {
      resolver.resolve("item-23");
    }),
  );
});
