import { describe, expect, it } from "vitest";
import {
  createVariantResolutionPlan,
  listVariantEntries,
  resolveVariantConfig,
  resolveVariantConfigFromPlan,
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
  preview: { config: {} },
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

  it("matches recursive config and feature resolution with a compiled plan", () => {
    const plan = createVariantResolutionPlan(baseRegistry);

    expect(resolveVariantConfigFromPlan("article", baseRegistry, appRegistry, plan)).toEqual(
      resolveVariantConfig("article", baseRegistry, appRegistry),
    );
    expect(plan.article).toEqual(["seo", "hero", "article"]);
    expect(plan.inactive).toEqual([]);
  });

  it("compiles runtime activity overrides into the resolution plan", () => {
    const overrides = {
      ...appRegistry,
      hero: { active: false },
    };
    const plan = createVariantResolutionPlan(baseRegistry, overrides);

    expect(plan.article).toEqual(["seo", "article"]);
    expect(resolveVariantConfigFromPlan("article", baseRegistry, overrides, plan)).toEqual(
      resolveVariantConfig("article", baseRegistry, overrides),
    );
  });

  it("keeps structural inheritance in the build-time registry", () => {
    expect(resolveVariantConfig("editorial", baseRegistry, appRegistry)).toEqual({
      tone: "app",
      indexed: true,
      titleTemplate: "%s - Site",
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
    expect(variantHasFeature("editorial", "seo", baseRegistry, appRegistry)).toBe(true);
    expect(variantHasFeature("editorial", "hero", baseRegistry, appRegistry)).toBe(false);
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

  it("lists registered variants with normalized extends and override config keys", () => {
    expect(listVariantEntries(baseRegistry, appRegistry)).toEqual([
      { name: "seo", extends: [], configKeys: ["indexed", "titleTemplate"] },
      { name: "hero", extends: [], configKeys: ["height", "slots"] },
      { name: "article", extends: ["seo", "hero"], configKeys: ["hasDate", "slots", "authorBox"] },
      { name: "editorial", extends: ["seo"], configKeys: ["tone"] },
      { name: "inactive", extends: ["seo"], configKeys: ["hidden"] },
      { name: "loopA", extends: ["loopB"], configKeys: [] },
      { name: "loopB", extends: ["loopA"], configKeys: [] },
      { name: "broken", extends: ["missing"], configKeys: [] },
      { name: "preview", extends: [], configKeys: ["previewMode"] },
    ]);
  });

  it("collects build-time and runtime contract violations without duplicate cycles", () => {
    expect(collectVariantDiagnostics(baseRegistry, appRegistry)).toEqual([
      {
        code: "unknown-parent",
        severity: "error",
        variant: "broken",
        parent: "missing",
        message: 'Variant "broken" extends unknown variant "missing".',
      },
      {
        code: "circular-extends",
        severity: "error",
        variant: "loopA",
        path: ["loopA", "loopB", "loopA"],
        message: "Variant inheritance cycle detected: loopA -> loopB -> loopA.",
      },
      {
        code: "runtime-extends",
        severity: "error",
        variant: "editorial",
        message:
          'App config for variant "editorial" defines extends. Move structural inheritance to variants.registry.',
      },
    ]);
  });

  it("rejects app config entries that are absent from the build-time registry", () => {
    expect(collectVariantDiagnostics({ content: {} }, { preview: { config: {} } })).toEqual([
      {
        code: "unknown-runtime-override",
        severity: "error",
        variant: "preview",
        message:
          'App config overrides unknown variant "preview". Register it in variants.registry first.',
      },
    ]);
  });
});
