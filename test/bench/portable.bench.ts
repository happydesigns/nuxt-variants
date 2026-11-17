import { bench, describe } from "vitest";
import { createVariantResolver } from "../../src/core";
import {
  createVariantResolutionPlan,
  resolveVariantConfigFromPlan,
  type VariantRegistry,
} from "../../src/runtime/utils/variants";

const registry: VariantRegistry = Object.fromEntries(
  Array.from({ length: 24 }, (_, i) => [
    `item-${i}`,
    { extends: i ? [`item-${i - 1}`] : [], config: { [`key${i}`]: i, links: [i] } },
  ]),
);
const resolver = createVariantResolver(registry);
const plan = createVariantResolutionPlan(registry);
describe("existing Nuxt plan vs portable resolver (24 entries, same merge semantics)", () => {
  bench("existing compiled config resolution", () => {
    resolveVariantConfigFromPlan("item-23", registry, {}, plan);
  });
  bench("portable resolution including isolated output", () => {
    resolver.resolve("item-23");
  });
});
