import { describe, expect, it } from "vitest";
import {
  createVariantResolutionPlan,
  listVariantEntries,
  resolveVariantConfig,
  resolveVariantConfigFromLineage,
  resolveVariantConfigFromPlan,
  resolveVariantFeatures,
  variantHasFeature,
  type VariantOverrideRegistry,
  type VariantRegistry,
} from "../../src/runtime/utils/variants";
import {
  collectVariantDiagnostics,
  collectVariantInputDiagnostics,
} from "../../src/runtime/utils/diagnostics";

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
  describe("parent config priority", () => {
    const sharedRegistry: VariantRegistry = {
      base: { config: { color: "blue", slots: ["base"] } },
      customized: {
        extends: ["base"],
        config: { color: "red", slots: ["customized"], customizedOnly: true },
      },
      plain: { extends: ["base"] },
    };

    it.each<{
      name: string;
      parents: string[];
      overrides: VariantOverrideRegistry;
      expected: Record<string, unknown>;
    }>([
      {
        name: "lets the later parent's inherited values win in a diamond",
        parents: ["customized", "plain"],
        overrides: {},
        expected: { color: "blue", slots: ["base"], customizedOnly: true },
      },
      {
        name: "respects reversed parent priority",
        parents: ["plain", "customized"],
        overrides: {},
        expected: { color: "red", slots: ["customized"], customizedOnly: true },
      },
      {
        name: "includes shared ancestor app config in the later parent",
        parents: ["customized", "plain"],
        overrides: { base: { config: { color: "green", slots: ["runtime"] } } },
        expected: { color: "green", slots: ["runtime"], customizedOnly: true },
      },
      {
        name: "omits an inactive later parent",
        parents: ["customized", "plain"],
        overrides: { plain: { active: false } },
        expected: { color: "red", slots: ["customized"], customizedOnly: true },
      },
    ])("$name", ({ parents, overrides, expected }) => {
      const registry = { ...sharedRegistry, article: { extends: parents } };
      const plan = createVariantResolutionPlan(registry, overrides);
      const lineage = [...resolveVariantFeatures("article", registry, overrides)];

      expect(resolveVariantConfig("article", registry, overrides)).toEqual(expected);
      expect(resolveVariantConfigFromPlan("article", registry, overrides, plan)).toEqual(expected);
      expect(resolveVariantConfigFromLineage(lineage, registry, overrides)).toEqual(expected);
    });

    it("merges complete parent configs before applying sibling defaults", () => {
      const registry: VariantRegistry = {
        earlier: { config: { nested: { fromEarlier: true } } },
        base: { config: { nested: false } },
        later: { extends: ["base"], config: { nested: { fromLater: true } } },
        article: { extends: ["earlier", "later"] },
      };
      const expected = { nested: { fromEarlier: true, fromLater: true } };
      const plan = createVariantResolutionPlan(registry);

      expect(resolveVariantConfig("article", registry, {})).toEqual(expected);
      expect(resolveVariantConfigFromPlan("article", registry, {}, plan)).toEqual(expected);
      expect(resolveVariantConfigFromLineage(plan.article!, registry, {})).toEqual(expected);
    });
  });

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

  it("resolves activity overrides from a single selected lineage", () => {
    const overrides = {
      ...appRegistry,
      hero: { active: false },
    };
    const lineage = [...resolveVariantFeatures("article", baseRegistry, overrides)];

    expect(lineage).toEqual(["seo", "article"]);
    expect(resolveVariantConfigFromLineage(lineage, baseRegistry, overrides)).toEqual(
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

  it("bounds shared-ancestor traversal by the distinct registry entries", () => {
    const registry: VariantRegistry = { base: {} };
    let parents = ["base"];
    for (let depth = 1; depth <= 16; depth++) {
      registry[`left-${depth}`] = { extends: [...parents] };
      registry[`right-${depth}`] = { extends: [...parents] };
      parents = [`left-${depth}`, `right-${depth}`];
    }
    registry.target = { extends: parents };
    let reads = 0;
    const observed = new Proxy(registry, {
      get(target, key, receiver) {
        if (typeof key === "string" && Object.hasOwn(target, key)) reads++;
        return Reflect.get(target, key, receiver);
      },
    });

    expect([...resolveVariantFeatures("target", observed, {})]).toEqual(Object.keys(registry));
    expect(reads).toBeLessThanOrEqual(Object.keys(registry).length * 2);
  });

  it("preserves caller visited exclusions without adding traversed parents to that set", () => {
    const visited = new Set(["seo"]);
    expect([...resolveVariantFeatures("article", baseRegistry, appRegistry, visited)]).toEqual([
      "hero",
      "article",
    ]);
    expect([...visited]).toEqual(["seo", "article"]);
    expect([...resolveVariantFeatures("article", baseRegistry, appRegistry, visited)]).toEqual([]);
  });

  it("keeps cycle, missing-parent and activity-override behavior across shared paths", () => {
    const registry: VariantRegistry = {
      base: {},
      hidden: {},
      paused: { extends: "hidden", active: false },
      loopA: { extends: "loopB" },
      loopB: { extends: "loopA" },
      left: { extends: ["base", "paused", "missing", "loopA"] },
      right: { extends: ["base", "paused", "loopA"] },
      target: { extends: ["left", "right", "preview"] },
    };
    expect([...resolveVariantFeatures("target", registry, { preview: { config: {} } })]).toEqual([
      "base",
      "loopB",
      "loopA",
      "left",
      "right",
      "preview",
      "target",
    ]);
    expect([
      ...resolveVariantFeatures("target", registry, {
        base: { active: false },
        paused: { active: true },
      }),
    ]).toEqual(["hidden", "paused", "loopB", "loopA", "left", "right", "target"]);
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

  it("rejects unknown fields instead of silently ignoring typos", () => {
    expect(
      collectVariantDiagnostics(
        { content: { config: {}, configs: { toc: true } } } as VariantRegistry,
        { content: { actve: false } },
      ),
    ).toEqual([
      {
        code: "unknown-registry-field",
        severity: "error",
        variant: "content",
        field: "configs",
        message: 'Registry for variant "content" contains unknown field "configs".',
      },
      {
        code: "unknown-runtime-field",
        severity: "error",
        variant: "content",
        field: "actve",
        message: 'App config for variant "content" contains unknown field "actve".',
      },
    ]);
  });

  it("reports malformed raw entries before registry normalization", () => {
    expect(
      collectVariantInputDiagnostics(
        {
          article: null,
          event: { extends: ["hero", 42], active: "yes", config: [] },
          landing: ["hero", false],
        },
        {
          article: null,
          event: { active: 1, config: "wide" },
        },
      ),
    ).toEqual([
      expect.objectContaining({ code: "invalid-registry-entry", variant: "article" }),
      expect.objectContaining({ code: "invalid-extends", variant: "event", field: "extends" }),
      expect.objectContaining({ code: "invalid-active", variant: "event", field: "active" }),
      expect.objectContaining({ code: "invalid-config", variant: "event", field: "config" }),
      expect.objectContaining({ code: "invalid-extends", variant: "landing", field: "extends" }),
      expect.objectContaining({ code: "invalid-runtime-entry", variant: "article" }),
      expect.objectContaining({ code: "invalid-active", variant: "event", field: "active" }),
      expect.objectContaining({ code: "invalid-config", variant: "event", field: "config" }),
    ]);
  });
});
