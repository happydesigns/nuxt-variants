import { describe, expect, it } from "vitest";
import { createVariantGraph } from "../../src/runtime/utils/graph";

describe("createVariantGraph", () => {
  it("normalizes full entries and shorthand arrays", () => {
    expect(
      createVariantGraph({
        base: {},
        article: { extends: "base", config: { ignored: true } },
        landing: ["base", "article"],
      }),
    ).toEqual({
      base: [],
      article: ["base"],
      landing: ["base", "article"],
    });
  });

  it("copies extends arrays instead of exposing registry state", () => {
    const parents = ["base"];
    const graph = createVariantGraph({ article: { extends: parents } });

    parents.push("seo");
    expect(graph.article).toEqual(["base"]);
  });
});
