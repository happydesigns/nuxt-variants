import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

/**
 * Extract and JSON-parse the text content of the first element with the given
 * id from an SSR HTML string. Vue template `{{ }}` HTML-encodes values, so we
 * decode the common entities before parsing.
 */
function extractJson(html: string, id: string): unknown {
  const match = html.match(new RegExp(`id="${id}">([\\s\\S]*?)<\\/`));
  if (!match) throw new Error(`Element #${id} not found in HTML`);
  const decoded = match[1]!
    .trim()
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  return JSON.parse(decoded);
}

describe("nuxt-variants e2e", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/variants", import.meta.url)),
  });

  // -------------------------------------------------------------------------
  // useVariant() — config resolution
  // -------------------------------------------------------------------------

  describe("useVariant() — config resolution", () => {
    it("returns own config for a base feature variant", async () => {
      const html = await $fetch<string>("/variant/seo");
      expect(extractJson(html, "config")).toEqual({
        indexed: true,
        seoScore: 90,
      });
    });

    it("returns own config for another base feature variant", async () => {
      const html = await $fetch<string>("/variant/hero");
      expect(extractJson(html, "config")).toEqual({
        fullscreen: true,
        columns: 2,
      });
    });

    it("merges own config with all inherited ancestor configs", async () => {
      const html = await $fetch<string>("/variant/article");
      expect(extractJson(html, "config")).toEqual({
        // Own config — app.config override flips hasDate to false
        hasDate: false,
        // Inherited from seo
        indexed: true,
        seoScore: 90,
        // Inherited from hero
        fullscreen: true,
        columns: 2,
      });
    });

    it("app.config override wins over nuxt.config base entry", async () => {
      const html = await $fetch<string>("/variant/article");
      const config = extractJson(html, "config") as Record<string, unknown>;
      // nuxt.config has hasDate: true; app.config overrides to false
      expect(config.hasDate).toBe(false);
    });

    it("resolves shorthand array registry entry (extends, no own config)", async () => {
      const html = await $fetch<string>("/variant/event");
      const config = extractJson(html, "config") as Record<string, unknown>;
      // event: ['seo', 'hero'] — inherits from both, no own config
      expect(config.indexed).toBe(true);
      expect(config.seoScore).toBe(90);
      expect(config.fullscreen).toBe(true);
      expect(config.columns).toBe(2);
    });

    it("resolves app.config-only variant not in nuxt.config registry", async () => {
      const html = await $fetch<string>("/variant/extra");
      const config = extractJson(html, "config") as Record<string, unknown>;
      expect(config.custom).toBe(42);
    });

    it("returns empty config for unknown variant", async () => {
      const html = await $fetch<string>("/variant/nonexistent");
      expect(extractJson(html, "config")).toEqual({});
    });
  });

  // -------------------------------------------------------------------------
  // useVariant() — has() inheritance check
  // -------------------------------------------------------------------------

  describe("useVariant() — has()", () => {
    it("returns true when the variant is the queried feature itself", async () => {
      const html = await $fetch<string>("/variant/seo");
      expect(extractJson(html, "has-seo")).toBe(true);
    });

    it("returns false when variant does not extend the queried feature", async () => {
      const html = await $fetch<string>("/variant/seo");
      expect(extractJson(html, "has-hero")).toBe(false);
    });

    it("returns true for each direct parent", async () => {
      const html = await $fetch<string>("/variant/article");
      expect(extractJson(html, "has-seo")).toBe(true);
      expect(extractJson(html, "has-hero")).toBe(true);
    });

    it("detects parent via shorthand array entry", async () => {
      const html = await $fetch<string>("/variant/event");
      expect(extractJson(html, "has-seo")).toBe(true);
      expect(extractJson(html, "has-hero")).toBe(true);
    });

    it("returns false for an unrelated variant", async () => {
      const html = await $fetch<string>("/variant/hero");
      expect(extractJson(html, "has-seo")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // useVariants() — registry enumeration
  // -------------------------------------------------------------------------

  describe("useVariants()", () => {
    it("lists variants from both nuxt.config registry and app.config", async () => {
      const html = await $fetch<string>("/variants");
      const variants = extractJson(html, "variants") as Array<{
        name: string;
      }>;
      const names = variants.map((v) => v.name);
      // nuxt.config entries
      expect(names).toContain("seo");
      expect(names).toContain("hero");
      expect(names).toContain("article");
      expect(names).toContain("event");
      // app.config-only entry
      expect(names).toContain("extra");
    });

    it("each entry has the correct extends array", async () => {
      const html = await $fetch<string>("/variants");
      const variants = extractJson(html, "variants") as Array<{
        name: string;
        extends: string[];
      }>;

      const find = (name: string) => variants.find((v) => v.name === name)!;

      expect(find("seo").extends).toEqual([]);
      expect(find("hero").extends).toEqual([]);
      expect(find("article").extends).toContain("seo");
      expect(find("article").extends).toContain("hero");
      // shorthand event: ['seo','hero'] is normalised to extends
      expect(find("event").extends).toContain("seo");
      expect(find("event").extends).toContain("hero");
    });

    it("each entry lists configKeys from both base and app registries", async () => {
      const html = await $fetch<string>("/variants");
      const variants = extractJson(html, "variants") as Array<{
        name: string;
        configKeys: string[];
      }>;

      const find = (name: string) => variants.find((v) => v.name === name)!;

      expect(find("seo").configKeys).toContain("indexed");
      expect(find("seo").configKeys).toContain("seoScore");
      // article: base has hasDate; app.config also contributes hasDate
      expect(find("article").configKeys).toContain("hasDate");
    });
  });
});
