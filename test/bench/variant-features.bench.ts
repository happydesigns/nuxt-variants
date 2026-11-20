import { createRequire } from "node:module";
import { test } from "vitest";
import type { VariantRegistry } from "../../src/runtime/utils/variants";

// A native load keeps Vite instrumentation out of the measured merge and graph loops.
const require = createRequire(import.meta.url);
const {
  createVariantResolutionPlan,
  resolveVariantConfig,
  resolveVariantConfigFromLineage,
  resolveVariantConfigFromPlan,
  resolveVariantFeatures,
  variantHasFeature,
} =
  require("../../dist/runtime/utils/variants.js") as typeof import("../../src/runtime/utils/variants");

const registry: VariantRegistry = Object.fromEntries(
  Array.from({ length: 24 }, (_, index) => [
    `feature-${index}`,
    {
      extends: index === 0 ? undefined : `feature-${index - 1}`,
      config: {},
    },
  ]),
);
const checks = ["feature-0", "feature-4", "feature-8", "feature-12", "feature-16", "feature-23"];
const plan = createVariantResolutionPlan(registry);
const activeOverrides = { "feature-12": { active: false } };
const overriddenPlan = createVariantResolutionPlan(registry, activeOverrides);

const sharedRegistry: VariantRegistry = { base: {} };
let sharedParents = ["base"];
for (let depth = 1; depth <= 16; depth++) {
  sharedRegistry[`left-${depth}`] = { extends: [...sharedParents] };
  sharedRegistry[`right-${depth}`] = { extends: [...sharedParents] };
  sharedParents = [`left-${depth}`, `right-${depth}`];
}
sharedRegistry.target = { extends: sharedParents };

test("shared ancestor feature traversal (34 entries)", async ({ bench }) => {
  await bench("resolve selected lineage", () => {
    resolveVariantFeatures("target", sharedRegistry, {});
  }).run();
});

test("feature lookups", async ({ bench }) => {
  await bench.compare(
    bench("resolve the graph for every has() call", () => {
      for (const feature of checks) {
        variantHasFeature("feature-23", feature, registry, {});
      }
    }),
    bench("resolve once and reuse Set.has()", () => {
      const features = resolveVariantFeatures("feature-23", registry, {});
      for (const feature of checks) {
        features.has(feature);
      }
    }),
  );
});

test("config resolution", async ({ bench }) => {
  await bench.compare(
    bench("resolve config recursively", () => {
      resolveVariantConfig("feature-23", registry, {});
    }),
    bench("resolve config from a compiled plan", () => {
      resolveVariantConfigFromPlan("feature-23", registry, {}, plan);
    }),
    bench("resolve activity overrides recursively", () => {
      resolveVariantConfig("feature-23", registry, activeOverrides);
    }),
    bench("resolve activity overrides from a compiled plan", () => {
      resolveVariantConfigFromPlan("feature-23", registry, activeOverrides, overriddenPlan);
    }),
  );
});

test("activity override planning", async ({ bench }) => {
  await bench.compare(
    bench("compile every variant lineage", () => {
      const runtimePlan = createVariantResolutionPlan(registry, activeOverrides);
      resolveVariantConfigFromPlan("feature-23", registry, activeOverrides, runtimePlan);
    }),
    bench("resolve only the selected variant lineage", () => {
      const lineage = [...resolveVariantFeatures("feature-23", registry, activeOverrides)];
      resolveVariantConfigFromLineage(lineage, registry, activeOverrides);
    }),
  );
});
