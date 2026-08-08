import { bench, describe } from "vitest";
import {
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
