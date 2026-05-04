import { describe, expect, it } from "vitest";
import {
  listVariantEntries,
  resolveVariantConfig,
  variantHasFeature,
  type VariantRegistry,
} from "../../src/runtime/utils/variants";

const baseRegistry: VariantRegistry = {
  seo: { config: { indexed: true, titleTemplate: "%s - Site" } },
  hero: { config: { height: "md", slots: ["hero"] } },
  article: {
    extends: ["seo", "hero"],
    config: {
      hasDate: true,
      slots: ["article"],
    },
  },
  editorial: {
    extends: "seo",
    config: { tone: "base" },
  },
  inactive: {
    active: false,
    config: { hidden: true },
  },
};

const appRegistry: VariantRegistry = {
  article: {
    config: {
      hasDate: false,
      authorBox: true,
    },
  },
  editorial: {
    extends: ["hero"],
    config: { tone: "app" },
  },
  preview: {
    config: { previewMode: true },
  },
};

describe("variant runtime utilities", () => {
  it("resolves inherited config with app overrides winning over base config", () => {
    expect(resolveVariantConfig("article", baseRegistry, appRegistry)).toEqual({
      hasDate: false,
      slots: ["article"],
      authorBox: true,
      indexed: true,
      titleTemplate: "%s - Site",
      height: "md",
    });
  });

  it("lets app.config replace the extends chain while preserving base config", () => {
    expect(resolveVariantConfig("editorial", baseRegistry, appRegistry)).toEqual({
      tone: "app",
      height: "md",
      slots: ["hero"],
    });
  });

  it("returns app-only variants and skips inactive config resolution", () => {
    expect(resolveVariantConfig("preview", baseRegistry, appRegistry)).toEqual({
      previewMode: true,
    });
    expect(resolveVariantConfig("inactive", baseRegistry, appRegistry)).toEqual({});
  });

  it("checks direct and inherited features using the current has() semantics", () => {
    expect(variantHasFeature("article", "seo", baseRegistry, appRegistry)).toBe(true);
    expect(variantHasFeature("editorial", "seo", baseRegistry, appRegistry)).toBe(false);
    expect(variantHasFeature("editorial", "hero", baseRegistry, appRegistry)).toBe(true);
    expect(variantHasFeature("inactive", "inactive", baseRegistry, appRegistry)).toBe(true);
  });

  it("lists variants from both registries with normalized extends and config keys", () => {
    expect(listVariantEntries(baseRegistry, appRegistry)).toEqual([
      { name: "seo", extends: [], configKeys: ["indexed", "titleTemplate"] },
      { name: "hero", extends: [], configKeys: ["height", "slots"] },
      { name: "article", extends: ["seo", "hero"], configKeys: ["hasDate", "slots", "authorBox"] },
      { name: "editorial", extends: ["hero"], configKeys: ["tone"] },
      { name: "inactive", extends: [], configKeys: ["hidden"] },
      { name: "preview", extends: [], configKeys: ["previewMode"] },
    ]);
  });
});
