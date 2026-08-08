import { describe, expect, it } from "vitest";
import {
  listVariantEntries,
  resolveVariantConfig,
  resolveVariantFeatures,
  variantHasFeature,
  type VariantRegistry,
} from "../../src/runtime/utils/variants";
import { collectVariantDiagnostics } from "../../src/runtime/utils/diagnostics";

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
    extends: ["seo"],
    config: { hidden: true },
  },
  loopA: { extends: ["loopB"], config: {} },
  loopB: { extends: ["loopA"], config: {} },
  broken: { extends: ["missing"], config: {} },
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
    expect(variantHasFeature("inactive", "inactive", baseRegistry, appRegistry)).toBe(false);
    expect(variantHasFeature("inactive", "seo", baseRegistry, appRegistry)).toBe(false);
  });

  it("resolves each active feature once in inheritance order", () => {
    expect([...resolveVariantFeatures("article", baseRegistry, appRegistry)]).toEqual([
      "seo",
      "hero",
      "article",
    ]);
    expect([...resolveVariantFeatures("inactive", baseRegistry, appRegistry)]).toEqual([]);
    expect([...resolveVariantFeatures("missing", baseRegistry, appRegistry)]).toEqual([]);
  });

  it("lists variants from both registries with normalized extends and config keys", () => {
    expect(listVariantEntries(baseRegistry, appRegistry)).toEqual([
      { name: "seo", extends: [], configKeys: ["indexed", "titleTemplate"] },
      { name: "hero", extends: [], configKeys: ["height", "slots"] },
      { name: "article", extends: ["seo", "hero"], configKeys: ["hasDate", "slots", "authorBox"] },
      { name: "editorial", extends: ["hero"], configKeys: ["tone"] },
      { name: "inactive", extends: ["seo"], configKeys: ["hidden"] },
      { name: "loopA", extends: ["loopB"], configKeys: [] },
      { name: "loopB", extends: ["loopA"], configKeys: [] },
      { name: "broken", extends: ["missing"], configKeys: [] },
      { name: "preview", extends: [], configKeys: ["previewMode"] },
    ]);
  });

  it("collects diagnostics for unknown parents, cycles, and app extends replacements", () => {
    expect(collectVariantDiagnostics(baseRegistry, appRegistry)).toEqual([
      {
        code: "unknown-parent",
        severity: "warning",
        variant: "broken",
        parent: "missing",
        message: 'Variant "broken" extends unknown variant "missing".',
      },
      {
        code: "circular-extends",
        severity: "warning",
        variant: "loopA",
        path: ["loopA", "loopB", "loopA"],
        message: "Variant inheritance cycle detected: loopA -> loopB -> loopA.",
      },
      {
        code: "circular-extends",
        severity: "warning",
        variant: "loopB",
        path: ["loopB", "loopA", "loopB"],
        message: "Variant inheritance cycle detected: loopB -> loopA -> loopB.",
      },
      {
        code: "override-extends",
        severity: "warning",
        variant: "editorial",
        message: 'App config for variant "editorial" replaces the base extends chain.',
      },
    ]);
  });
});
