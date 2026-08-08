import { describe, it, expect } from "vitest";
import { z } from "zod";
import * as v from "valibot";
import {
  createVariantSchemaResolver,
  mergeVariantSchemas,
  detectAdapter,
  zodAdapter,
  valibotAdapter,
} from "../../src/schemas";

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
    expect(merged.shape.x).toBe(extraStr);
  });
});

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

const graph = {
  seo: [],
  hero: [],
  article: ["seo", "hero"],
  blog: ["article"],
};

describe("mergeVariantSchemas with Zod", () => {
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

  it("lets child schemas override inherited fields", () => {
    const parentField = z.string();
    const childField = z.number();
    const registry = {
      seo: z.object({ title: parentField }),
      article: z.object({ title: childField }),
    };
    const merged = mergeVariantSchemas(["article"], registry, graph);
    expect((merged as any).shape.title).toBe(childField);
  });

  it("skips variants with no schema", () => {
    const registry = {
      seo: z.object({ title: z.string() }),
      hero: undefined,
      article: z.object({ date: z.boolean() }),
    };
    const merged = mergeVariantSchemas(["article"], registry, graph);
    const keys = Object.keys((merged as any).shape);
    expect(keys).toContain("title");
    expect(keys).toContain("date");
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

  it("lets later active variants override earlier active variants", () => {
    const seoField = z.string();
    const heroField = z.boolean();
    const registry = {
      seo: z.object({ shared: seoField }),
      hero: z.object({ shared: heroField }),
    };
    const merged = mergeVariantSchemas(["seo", "hero"], registry, graph);
    expect((merged as any).shape.shared).toBe(heroField);
  });

  it("returns a valid empty object schema when no reachable registry entry matches", () => {
    const merged = mergeVariantSchemas(
      ["article"],
      { blog: z.object({ author: z.string() }) },
      graph,
    );
    expect(merged).toBeInstanceOf(z.ZodObject);
    expect(merged.shape).toEqual({});
  });

  it("returns a valid empty object schema for an empty activeVariants array", () => {
    const registry = { seo: z.object({ title: z.string() }) };
    const merged = mergeVariantSchemas([], registry, graph);
    expect(merged).toBeInstanceOf(z.ZodObject);
    expect(merged.shape).toEqual({});
  });

  it("uses an explicit adapter for an entirely empty registry", () => {
    const merged = mergeVariantSchemas([], {}, graph, { adapter: zodAdapter });
    expect(merged).toBeInstanceOf(z.ZodObject);
    expect(merged.shape).toEqual({});
  });

  it("does not infinite-loop on a circular graph and still merges reachable schemas", () => {
    const cyclicGraph = { a: ["b"], b: ["a"] };
    const registry = {
      a: z.object({ fromA: z.string() }),
      b: z.object({ fromB: z.number() }),
    };
    const merged = mergeVariantSchemas(["a"], registry, cyclicGraph);
    const keys = Object.keys((merged as any).shape);
    expect(keys).toContain("fromA");
    expect(keys).toContain("fromB");
  });
});

describe("mergeVariantSchemas with Valibot", () => {
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

  it("lets child Valibot schemas override inherited entries", () => {
    const parentField = v.string();
    const childField = v.number();
    const registry = {
      seo: v.object({ title: parentField }),
      article: v.object({ title: childField }),
    };
    const merged = mergeVariantSchemas(["article"], registry as any, graph);
    expect((merged as any).entries.title).toBe(childField);
  });
});

describe("mergeVariantSchemas graph resolution", () => {
  it("throws when an active variant is unknown", () => {
    expect(() =>
      mergeVariantSchemas(["missing"], { seo: z.object({ title: z.string() }) }, graph),
    ).toThrow(/unknown active variant "missing"/i);
  });

  it("throws when a schema registry key is unknown", () => {
    expect(() =>
      mergeVariantSchemas(["seo"], { missing: z.object({ title: z.string() }) }, graph),
    ).toThrow(/schema registered for unknown variant "missing"/i);
  });

  it("throws when an empty registry has no explicit adapter", () => {
    expect(() => mergeVariantSchemas([], {}, graph)).toThrow(/registry is empty/i);
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

describe("createVariantSchemaResolver", () => {
  const variantRegistry = {
    seo: {},
    article: { extends: "seo" },
  };

  it("binds registry inheritance and Zod schemas once", () => {
    const resolveSchema = createVariantSchemaResolver(variantRegistry, {
      seo: z.object({ title: z.string() }),
      article: z.object({ date: z.date() }),
    });

    expect(Object.keys(resolveSchema(["article"]).shape)).toEqual(["title", "date"]);
  });

  it("preserves Valibot schema inference", () => {
    const resolveSchema = createVariantSchemaResolver(variantRegistry, {
      seo: v.object({ title: v.string() }),
      article: v.object({ date: v.date() }),
    });

    expect(Object.keys(resolveSchema(["article"]).entries)).toEqual(["title", "date"]);
  });

  it("keeps unknown variants as configuration errors", () => {
    const resolveSchema = createVariantSchemaResolver(variantRegistry, {
      seo: z.object({ title: z.string() }),
    });

    expect(() => resolveSchema(["missing"])).toThrow(/unknown active variant "missing"/i);
  });
});
