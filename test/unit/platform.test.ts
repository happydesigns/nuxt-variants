import { describe, expect, expectTypeOf, it } from "vitest";
import { comarkContent, generateSourceTypes } from "comark-content";
import snapshot from "comark-content/sources/snapshot";
import {
  createVariantResolver,
  defineVariantGroups,
  type ResolvedVariantConfig,
} from "@happydesigns/composable-variants";
import { variantContent, variantField } from "@happydesigns/composable-variants/comark-content";
import {
  createVariantsDevframe,
  createVariantDevtoolsData,
  type VariantDevtoolsData,
} from "@happydesigns/composable-variants/devtools";
import { createHostContext } from "devframe/node";
import { resolveVariantConfig, resolveVariantFeatures } from "../../src/runtime/utils/variants";

const registry = {
  base: { config: { title: "Base", nested: { inherited: true }, links: ["base"] } },
  left: { extends: "base", config: { title: "Left" } },
  right: { extends: "base", config: { links: ["right"] } },
  article: { extends: ["left", "right"], config: { nested: { own: "Required" }, count: 1 } },
} as const;

describe("portable resolver", () => {
  it("defines overlapping groups with literal, immutable membership", () => {
    const resolver = createVariantResolver(registry);
    const groupInput = { editorial: ["article"], "With base": ["article", "base"] } as const;
    const groups = defineVariantGroups(resolver, groupInput);
    expectTypeOf(groups.editorial).toEqualTypeOf<readonly ["article"]>();
    expect(groups["With base"]).toEqual(["article", "base"]);
    expect(groups.editorial).not.toBe(groupInput.editorial);
    expect(Object.isFrozen(groups.editorial)).toBe(true);
    expect(() => {
      // @ts-expect-error Names in a group must belong to the resolver.
      defineVariantGroups(resolver, { editorial: ["unknown"] });
    }).toThrow(/editorial.*unknown/);
    expect(() => defineVariantGroups(resolver, { editorial: ["article", "article"] })).toThrow(
      /duplicate/,
    );
  });
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
  it("reuses immutable defaults independently of caller-owned results and overrides", () => {
    const resolver = createVariantResolver(registry);
    const first = resolver.resolve("article");
    first.config.links?.push("changed");
    const runtime = { right: { config: { links: ["request"] } } };
    expect(resolver.resolve("article", runtime).config.links).toEqual(["request"]);
    runtime.right.config.links[0] = "second request";
    expect(resolver.resolve("article", runtime).config.links).toEqual(["second request"]);
    expect(resolver.resolve("article", {}).config.links).toEqual(["right"]);
    expect(resolver.resolve("article", { right: { active: false } }).config.links).toEqual([
      "base",
    ]);
  });
  it("accepts shared config objects and rejects malformed top-level maps", () => {
    const shared = { label: "Shared" };
    const resolver = createVariantResolver({ item: { config: { first: shared, second: shared } } });
    expect(resolver.resolve("item").config).toEqual({ first: shared, second: shared });
    expect(() => createVariantResolver([] as never)).toThrow(/maps must be plain objects/);
    expect(() => createVariantResolver({ item: {} }, false as never)).toThrow(
      /maps must be plain objects/,
    );
    expect(() => resolver.resolve("item", [] as never)).toThrow(/maps must be plain objects/);
  });
  it("rejects fields that cannot round-trip through a plain-data copy", () => {
    let getterReads = 0;
    const computed = {
      get label() {
        getterReads++;
        return "text";
      },
    };
    const hidden = Object.defineProperty({}, "label", { value: "text" });
    for (const config of [computed, hidden, { [Symbol("label")]: "text" }]) {
      expect(() => createVariantResolver({ page: { config } })).toThrow(/data properties/);
    }
    expect(getterReads).toBe(0);
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
  it("uses one group for field choices, document selection and generated types", async () => {
    const resolver = createVariantResolver({ ...registry, event: { extends: "base" } });
    const groups = defineVariantGroups(resolver, { Editorial: ["article", "event"] });
    const files: Record<string, string> = {
      "article.md": "---\nvariant: article\n---\nArticle",
      "event.md": "---\nvariant: event\n---\nEvent",
    };
    const field = variantField(groups.Editorial);
    const instance = comarkContent("editorialtest", {
      source: {
        schema: { type: "object", properties: { variant: field } },
        keys: () => Object.keys(files),
        getItem: (key) => files[key]!,
        getItemRaw: (key) => files[key]!,
      },
      plugins: [variantContent({ resolver, allowedVariants: groups.Editorial })],
      logger: false,
      onError: "throw",
    });
    try {
      expect(field.enum).toEqual(["article", "event"]);
      const article = (await instance.get("/article"))!;
      expectTypeOf(instance.variantName(article)).toEqualTypeOf<"article" | "event">();
      expect(instance.variantName(article)).toBe("article");
      expect(instance.variantName((await instance.get("/event"))!)).toBe("event");
      const types = await generateSourceTypes(instance);
      expect(types).toContain('variant?: "article" | "event"');
      expect(types).toContain('\'data.variant\'?: "article" | "event"');
      const restored = comarkContent("restoreeditorial", {
        source: snapshot(JSON.parse(JSON.stringify(await instance.snapshot()))),
        plugins: [variantContent({ resolver, allowedVariants: groups.Editorial })],
        logger: false,
        onError: "throw",
      });
      try {
        expect(restored.variantName((await restored.get("/event"))!)).toBe("event");
        expect(() =>
          restored.variantName({
            ...article,
            data: {},
            meta: { ...article.meta, variant: { name: "base" } },
          }),
        ).toThrow(/base.*not allowed.*article.*event/);
      } finally {
        await restored.dispose();
      }
    } finally {
      await instance.dispose();
    }
  });

  it("rejects out-of-group names, defaults and mismatched field choices", async () => {
    const resolver = createVariantResolver(registry);
    const { Editorial } = defineVariantGroups(resolver, { Editorial: ["article"] });
    expect(() => {
      // @ts-expect-error A registry name outside the allowed group cannot be the default.
      variantContent({ resolver, allowedVariants: Editorial, defaultVariant: "base" });
    }).toThrow(/Default variant.*base.*outside/);
    const text = "---\nvariant: base\n---\nBody";
    const source = {
      schema: { type: "object", properties: { variant: variantField() } },
      keys: () => ["entry.md"],
      getItem: () => text,
      getItemRaw: () => text,
    } as const;
    const options = {
      plugins: [variantContent({ resolver, allowedVariants: Editorial })] as const,
    };
    const instance = comarkContent("outsidegroup", {
      source,
      ...options,
      logger: false,
      onError: "throw",
    });
    try {
      await expect(instance.get("/entry")).rejects.toThrow(/base.*not allowed.*article/);
      expect(() =>
        comarkContent("mismatchedgroups", {
          ...options,
          source: {
            ...source,
            schema: { type: "object", properties: { variant: variantField(["base"]) } },
          },
        }),
      ).toThrow(/choices must match/);
    } finally {
      await instance.dispose();
    }
  });
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
    const resolver = createVariantResolver(registry);
    const groups = defineVariantGroups(resolver, {
      Editorial: ["article"],
      Features: ["base", "left"],
    });
    const metadata = {
      configKey: "variants",
      registry: resolver.registry,
      sources: {},
      groups,
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
    expect(after.groups).toEqual(groups);
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
