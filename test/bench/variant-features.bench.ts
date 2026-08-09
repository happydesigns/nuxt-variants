import { bench, describe } from "vitest";
import {
  createVariantResolutionPlan,
  resolveVariantConfig,
  resolveVariantConfigFromPlan,
  resolveVariantFeatures,
  variantHasFeature,
  type VariantRegistry,
} from "../../src/runtime/utils/variants";

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

describe("feature lookups", () => {
  bench("resolve the graph for every has() call", () => {
    for (const feature of checks) {
      variantHasFeature("feature-23", feature, registry, {});
    }
  });

  bench("resolve once and reuse Set.has()", () => {
    const features = resolveVariantFeatures("feature-23", registry, {});
    for (const feature of checks) {
      features.has(feature);
    }
  });
});

describe("config resolution", () => {
  bench("resolve config recursively", () => {
    resolveVariantConfig("feature-23", registry, {});
  });

  bench("resolve config from a compiled plan", () => {
    resolveVariantConfigFromPlan("feature-23", registry, {}, plan);
  });

  bench("resolve activity overrides recursively", () => {
    resolveVariantConfig("feature-23", registry, activeOverrides);
  });

  bench("resolve activity overrides from a compiled plan", () => {
    resolveVariantConfigFromPlan("feature-23", registry, activeOverrides, overriddenPlan);
  });
});
