import { describe, expect, expectTypeOf, it } from "vitest";
import { comarkContent, generateSourceTypes } from "comark-content";
import snapshot from "comark-content/sources/snapshot";
import { createVariantResolver, type ResolvedVariantConfig } from "../../src/core";
import { variantContent, variantField } from "../../src/content";
import {
  createVariantsDevframe,
  createVariantDevtoolsData,
  type VariantDevtoolsData,
} from "../../src/devtools";
import { createHostContext } from "devframe/node";
import { resolveVariantConfig, resolveVariantFeatures } from "../../src/runtime/utils/variants";

const registry = {
  base: { config: { title: "Base", nested: { inherited: true }, links: ["base"] } },
  left: { extends: "base", config: { title: "Left" } },
  right: { extends: "base", config: { links: ["right"] } },
  article: { extends: ["left", "right"], config: { nested: { own: "Required" }, count: 1 } },
} as const;

describe("portable resolver", () => {
  it("retains complete-parent precedence and independent request overrides", () => {
    const resolver = createVariantResolver(registry);
    const overrides = { right: { active: false }, article: { config: { count: 2 } } };
    const scenarios = [{}, overrides, { article: { active: false } }] as const;
    for (const runtime of scenarios) {
      const result = resolver.resolve("article", runtime);
      expect(result.config).toEqual(resolveVariantConfig("article", resolver.registry, runtime));
      expect(result.features).toEqual([
        ...resolveVariantFeatures("article", resolver.registry, runtime),
      ]);
    }
    expect(resolver.resolve("article").config.count).toBe(1);
  });
  it("compiles app defaults, preserving request isolation and activation", () => {
    const defaults = {
      progress: { active: false, config: { storage: { prefix: "course", scope: "local" } } },
    };
    const resolver = createVariantResolver({ progress: {}, course: ["progress"] }, defaults);
    expect(resolver.resolve("course").config).toEqual({});
    defaults.progress.config.storage.prefix = "mutated";
    const enabled = resolver.resolve("course", {
      progress: { active: true, config: { storage: { scope: "reader" } } },
    });
    expect(enabled.config).toEqual({ storage: { prefix: "course", scope: "reader" } });
    expect(resolver.resolve("course", { progress: { active: true } }).config.storage?.scope).toBe(
      "local",
    );
  });
  it("rejects class instances before cloning any config input", () => {
    class Setting {
      label = "text";
    }
    const entry = { base: { config: { setting: new Setting() } } };
    expect(() => createVariantResolver(entry)).toThrow(/plain data/);
    expect(() => createVariantResolver({ base: {} }, entry)).toThrow(/plain data/);
    const resolver = createVariantResolver({ base: { config: { setting: { label: "" } } } });
    expect(() => resolver.resolve("base", entry)).toThrow(/plain data/);
    expect(Object.isFrozen(entry.base.config.setting)).toBe(false);
  });
  it("copies inputs and returns fresh config/feature results", () => {
    const input = { base: { config: { items: ["one"] } } };
    const resolver = createVariantResolver(input);
    input.base.config.items.push("two");
    const first = resolver.resolve("base");
    first.config.items?.push("changed");
    expect(resolver.resolve("base").config.items).toEqual(["one"]);
    expect(Object.isFrozen(resolver.registry.base?.config)).toBe(true);
  });
  it("rejects invalid graphs, unknown names, and structural overrides", () => {
    expect(() => createVariantResolver({ a: ["missing"] })).toThrow(/unknown/i);
    const resolver = createVariantResolver(registry);
    expect(() => resolver.resolve("missing" as "article")).toThrow(/Unknown variant/);
    expect(() => resolver.resolve("article", { missing: {} } as never)).toThrow(/unknown/i);
    expect(() => resolver.resolve("article", { article: { extends: ["base"] } } as never)).toThrow(
      /extends/i,
    );
    expect(resolver.isName("constructor")).toBe(false);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => createVariantResolver({ a: { config: cyclic } })).toThrow(/Cyclic config/);
    expect(() => createVariantResolver({ a: { config: { date: new Date() } } })).toThrow(
      /plain data/,
    );
  });
  it("keeps own nested requirements and optional inherited fields in the active type", () => {
    type Config = ResolvedVariantConfig<typeof registry, "article">;
    expectTypeOf<Config["nested"]["own"]>().toEqualTypeOf<string>();
    expectTypeOf<Config["nested"]["inherited"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Config["title"]>().toEqualTypeOf<string | undefined>();
  });
  it("keeps nullish fallback compatible with runtime merging", () => {
    const resolver = createVariantResolver({
      base: { config: { title: "Base" } },
      article: { extends: "base", config: { title: null } },
    });
    const result = resolver.resolve("article");
    expect(result.config.title).toBe("Base");
    if (result.active) expectTypeOf(result.config.title).toEqualTypeOf<string | undefined>();
  });
});

describe("Comark Content adapter", () => {
  function content(text: string, name = "platform") {
    const resolver = createVariantResolver(registry);
    return comarkContent(name, {
      source: {
        schema: { type: "object", properties: { variant: variantField() } },
        keys: () => ["page.md"],
        getItem: () => text,
        getItemRaw: () => text,
      },
      logger: false,
      onError: "throw",
      plugins: [variantContent({ resolver, defaultVariant: "article" })],
    });
  }
  it("stores identity and resolves overrides after a JSON snapshot roundtrip", async () => {
    const original = content("---\ntitle: Hello\n---\nBody");
    const resolver = createVariantResolver(registry);
    const restored = comarkContent("restoredplatform", {
      source: snapshot(JSON.parse(JSON.stringify(await original.snapshot()))),
      plugins: [variantContent({ resolver })],
      logger: false,
    });
    try {
      const page = await restored.get("/page");
      expect(page?.meta.variant).toEqual({ name: "article" });
      const name = restored.variantName(page!);
      expect(restored.resolveVariant(name, { right: { active: false } }).config.title).toBe("Left");
      expect(restored.resolveVariant(name).config.title).toBe("Base");
    } finally {
      await original.dispose();
      await restored.dispose();
    }
  });
  it("rejects invalid frontmatter and revalidates trusted parsed snapshots at resolution", async () => {
    const invalid = content("---\nvariant: missing\n---\nBody", "invalidplatform");
    await expect(invalid.get("/page")).rejects.toThrow(/Unknown or missing/);
    await invalid.dispose();
    const original = content("Body", "snapshotplatform");
    try {
      const file = (await original.get("/page"))!;
      expect(() =>
        original.variantName({ ...file, meta: { ...file.meta, kind: "media" } }),
      ).toThrow(/not media/);
      expect(() =>
        original.variantName({
          ...file,
          data: {},
          meta: { ...file.meta, variant: { name: "removed" } },
        }),
      ).toThrow(/removed/);
    } finally {
      await original.dispose();
    }
  });
  it("generates literal names for data and top-level query fields", async () => {
    const instance = content("---\nvariant: article\n---\nBody", "typeplatform");
    try {
      await instance.init();
      const types = await generateSourceTypes(instance);
      expect(types).toContain('variant?: "base" | "left" | "right" | "article"');
      expect(types).toContain('\'data.variant\'?: "base" | "left" | "right" | "article"');
      expect(instance.fieldTypes.has("variant")).toBe(true);
    } finally {
      await instance.dispose();
    }
  });
  it("rejects unsupported semantic selector placement at setup", () => {
    const resolver = createVariantResolver(registry);
    expect(() =>
      comarkContent("invalidfield", {
        source: {
          schema: {
            type: "object",
            properties: { nested: { type: "object", properties: { variant: variantField() } } },
          },
          keys: () => [],
          getItem: () => "",
          getItemRaw: () => "",
        },
        plugins: [variantContent({ resolver, defaultVariant: "article" })],
      }),
    ).toThrow(/top-level field/);
  });
});

describe("DevFrame inspector", () => {
  it("reads current data through one namespaced query without caching overrides", async () => {
    let overrides = {};
    const metadata = {
      configKey: "variants",
      registry: createVariantResolver(registry).registry,
      sources: {},
    };
    const definition = createVariantsDevframe({
      snapshot: () => createVariantDevtoolsData(metadata, overrides),
    });
    const ctx = await createHostContext({
      cwd: process.cwd(),
      mode: "dev",
      host: {
        mountStatic() {},
        resolveOrigin: () => "http://127.0.0.1",
        getStorageDir: () => process.cwd(),
      },
    });
    await definition.setup(ctx, { flags: {} });
    const before: VariantDevtoolsData = await ctx.scope("nuxt-variants").rpc.call("get-snapshot");
    overrides = { right: { active: false } };
    const after: VariantDevtoolsData = await ctx.scope("nuxt-variants").rpc.call("get-snapshot");
    expect(before.variants.find((v) => v.name === "article")?.resolvedConfig.title).toBe("Base");
    expect(after.variants.find((v) => v.name === "article")?.resolvedConfig.title).toBe("Left");
    const methods = [...ctx.rpc.definitions.values()].filter((v) =>
      v.name.startsWith("nuxt-variants:"),
    );
    expect(methods.map((v) => [v.name, v.type, v.snapshot])).toEqual([
      ["nuxt-variants:get-snapshot", "query", true],
    ]);
  });
});
