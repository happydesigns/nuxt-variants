import { describe, expect, expectTypeOf, it } from "vitest";
import {
  defineVariantRegistry,
  normalizeVariantRegistry,
} from "../../src/runtime/utils/registry";

describe("defineVariantRegistry", () => {
  it("preserves literal names, parents, and config values", () => {
    const registry = defineVariantRegistry({
      header: {},
      article: {
        extends: ["header"],
        config: { density: "comfortable" },
      },
    });

    expectTypeOf<keyof typeof registry>().toEqualTypeOf<"header" | "article">();
    expectTypeOf(registry.article.extends).toEqualTypeOf<readonly ["header"]>();
    expectTypeOf(registry.article.config.density).toEqualTypeOf<"comfortable">();
  });
});

describe("normalizeVariantRegistry", () => {
  it("normalizes shorthand, readonly parents, and missing config", () => {
    const parents = ["header", "toc"] as const;
    const normalized = normalizeVariantRegistry({
      header: {},
      content: parents,
      article: { extends: parents, active: true },
    });

    expect(normalized).toEqual({
      header: { config: {}, extends: undefined },
      content: { extends: ["header", "toc"], config: {} },
      article: { extends: ["header", "toc"], active: true, config: {} },
    });
  });

  it("does not expose source arrays through normalized entries", () => {
    const parents = ["header"];
    const normalized = normalizeVariantRegistry({ article: { extends: parents } });

    parents.push("toc");
    expect(normalized.article?.extends).toEqual(["header"]);
  });
});
