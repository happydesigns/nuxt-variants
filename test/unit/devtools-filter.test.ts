import { describe, expect, it } from "vitest";
import { filterVariants } from "../../client/utils/filter-variants";
import type { VariantEntry } from "../../client/types/devtools";

const variants = [
  {
    active: true,
    activeFeatures: ["content", "article"],
    app: {},
    base: {},
    name: "article",
    extends: ["content"],
    configKeys: ["authorBox"],
    sources: [{ name: "Foundation", kind: "layer", entry: { config: {}, extends: [] } }],
    resolvedConfig: {},
  },
  {
    active: true,
    activeFeatures: ["content", "event"],
    app: {},
    base: {},
    name: "event",
    extends: ["content"],
    configKeys: ["location"],
    sources: [{ name: "Application", kind: "application", entry: { config: {}, extends: [] } }],
    resolvedConfig: {},
  },
] satisfies VariantEntry[];

describe("filterVariants", () => {
  it.each([
    ["article", "article"],
    ["content", "article"],
    ["author", "article"],
    ["foundation", "article"],
    ["LOCATION", "event"],
  ])("matches %s across inspector metadata", (query, expected) => {
    expect(filterVariants(variants, query).map(({ name }) => name)).toContain(expected);
  });

  it("returns the original list for an empty query", () => {
    expect(filterVariants(variants, "  ")).toBe(variants);
  });
});
