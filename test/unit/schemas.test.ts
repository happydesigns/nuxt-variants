import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import * as v from "valibot";
import { mergeVariantSchemas, detectAdapter, zodAdapter, valibotAdapter } from "../../src/schemas";

// ---------------------------------------------------------------------------
// zodAdapter
// ---------------------------------------------------------------------------

describe("zodAdapter", () => {
  it("emptyObject() returns an empty Zod object with no shape keys", () => {
    const schema = zodAdapter.emptyObject();
    expect(schema.shape).toEqual({});
    expect(typeof schema.extend).toBe("function");
  });

  it("merge() combines both shapes", () => {
    const base = z.object({ a: z.string() });
    const extra = z.object({ b: z.number() });
    const merged = zodAdapter.merge(base, extra);
    expect(Object.keys(merged.shape)).toContain("a");
    expect(Object.keys(merged.shape)).toContain("b");
  });

  it("merge() lets extra override base fields", () => {
    const baseNum = z.number();
    const extraStr = z.string();
    const base = z.object({ x: baseNum });
    const extra = z.object({ x: extraStr });
    const merged = zodAdapter.merge(base, extra);
    // extra.shape.x (string) should win over base.shape.x (number)
    expect(merged.shape.x).toBe(extraStr);
  });
});

// ---------------------------------------------------------------------------
// valibotAdapter
// ---------------------------------------------------------------------------

describe("valibotAdapter", () => {
  it("emptyObject() returns an empty Valibot object with no entries", () => {
    const schema = valibotAdapter.emptyObject();
    expect(schema.type).toBe("object");
    expect(schema.entries).toEqual({});
  });

  it("merge() combines both entry sets", () => {
    const base = v.object({ a: v.string() });
    const extra = v.object({ b: v.number() });
    const merged = valibotAdapter.merge(base, extra);
    expect(Object.keys(merged.entries)).toContain("a");
    expect(Object.keys(merged.entries)).toContain("b");
  });

  it("merge() lets extra override base entries", () => {
    const baseStr = v.string();
    const extraNum = v.number();
    const base = v.object({ x: baseStr });
    const extra = v.object({ x: extraNum });
    const merged = valibotAdapter.merge(base, extra);
    expect(merged.entries.x).toBe(extraNum);
  });
});

// ---------------------------------------------------------------------------
// detectAdapter
// ---------------------------------------------------------------------------

describe("detectAdapter", () => {
  it("returns zodAdapter for a Zod object schema", () => {
    const schema = z.object({ x: z.string() });
    expect(detectAdapter(schema as any)).toBe(zodAdapter);
  });

  it("returns valibotAdapter for a Valibot object schema", () => {
    const schema = v.object({ x: v.string() });
    expect(detectAdapter(schema as any)).toBe(valibotAdapter);
  });

  it("throws for an unrecognized schema shape", () => {
    expect(() => detectAdapter({} as any)).toThrow();
  });

  it("throws for null", () => {
    expect(() => detectAdapter(null as any)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// mergeVariantSchemas
// ---------------------------------------------------------------------------

const graph = {
  seo: [],
  hero: [],
  article: ["seo", "hero"],
  blog: ["article"],
};

describe("mergeVariantSchemas — Zod", () => {
  it("merges a single flat variant", () => {
    const registry = { seo: z.object({ title: z.string() }) };
    const merged = mergeVariantSchemas(["seo"], registry, graph);
    expect(Object.keys((merged as any).shape)).toContain("title");
  });

  it("resolves inherited schemas bottom-up", () => {
    const registry = {
      seo: z.object({ title: z.string() }),
      hero: z.object({ banner: z.boolean() }),
      article: z.object({ date: z.boolean() }),
    };
    const merged = mergeVariantSchemas(["article"], registry, graph);
    const keys = Object.keys((merged as any).shape);
    expect(keys).toContain("title");
    expect(keys).toContain("banner");
    expect(keys).toContain("date");
  });

  it("handles deep transitive inheritance", () => {
    const registry = {
      seo: z.object({ robots: z.string() }),
      hero: z.object({ banner: z.boolean() }),
      article: z.object({ date: z.boolean() }),
      blog: z.object({ author: z.string() }),
    };
    const merged = mergeVariantSchemas(["blog"], registry, graph);
    const keys = Object.keys((merged as any).shape);
    expect(keys).toContain("robots");
    expect(keys).toContain("banner");
    expect(keys).toContain("date");
    expect(keys).toContain("author");
  });

  it("skips variants with no schema (undefined entry)", () => {
    const registry = {
      seo: z.object({ title: z.string() }),
      hero: undefined,
      article: z.object({ date: z.boolean() }),
    };
    const merged = mergeVariantSchemas(["article"], registry, graph);
    const keys = Object.keys((merged as any).shape);
    expect(keys).toContain("title");
    expect(keys).toContain("date");
    // hero has no schema — must not throw
  });

  it("merges multiple active variants", () => {
    const registry = {
      seo: z.object({ title: z.string() }),
      hero: z.object({ banner: z.boolean() }),
    };
    const merged = mergeVariantSchemas(["seo", "hero"], registry, graph);
    const keys = Object.keys((merged as any).shape);
    expect(keys).toContain("title");
    expect(keys).toContain("banner");
  });

  it("returns empty object schema when no registry entry matches", () => {
    const merged = mergeVariantSchemas(["article"], {}, graph);
    expect(merged).toEqual({});
  });

  it("returns empty object schema for empty activeVariants array", () => {
    const registry = { seo: z.object({ title: z.string() }) };
    const merged = mergeVariantSchemas([], registry, graph);
    expect(merged).toEqual({});
  });
});

describe("mergeVariantSchemas — Valibot", () => {
  it("merges inherited schemas with Valibot schemas", () => {
    const registry = {
      seo: v.object({ title: v.string() }),
      hero: v.object({ banner: v.boolean() }),
      article: v.object({ date: v.boolean() }),
    };
    const merged = mergeVariantSchemas(["article"], registry as any, graph);
    const keys = Object.keys((merged as any).entries);
    expect(keys).toContain("title");
    expect(keys).toContain("banner");
    expect(keys).toContain("date");
  });
});

describe("mergeVariantSchemas — graph resolution", () => {
  beforeEach(() => {
    delete (globalThis as any).__NUXT_VARIANTS_GRAPH__;
  });

  afterEach(() => {
    delete (globalThis as any).__NUXT_VARIANTS_GRAPH__;
  });

  it("falls back to globalThis graph when no explicit graph provided", () => {
    (globalThis as any).__NUXT_VARIANTS_GRAPH__ = graph;
    const registry = { seo: z.object({ title: z.string() }) };
    const merged = mergeVariantSchemas(["seo"], registry);
    expect(Object.keys((merged as any).shape)).toContain("title");
  });

  it("throws when graph is omitted and globalThis has none", () => {
    expect(() => mergeVariantSchemas(["seo"], {})).toThrow(/no variant graph/i);
  });

  it("throws on adapter mismatch across variants", () => {
    const mixedRegistry = {
      seo: z.object({ title: z.string() }),
      hero: v.object({ banner: v.boolean() }),
      article: z.object({ date: z.boolean() }),
    };
    expect(() => mergeVariantSchemas(["article"], mixedRegistry as any, graph)).toThrow(
      /adapter mismatch/i,
    );
  });
});
