import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

function extractJson(html: string, id: string): unknown {
  const match = html.match(new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)<\\/`));
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

  describe("useVariant() config resolution", () => {
    it("returns own config for a base feature variant", async () => {
      const html = await $fetch<string>("/variant/seo");
      expect(extractJson(html, "config")).toEqual({
        indexed: true,
        seoScore: 90,
      });
    });

    it("merges own config with all inherited ancestor configs", async () => {
      const html = await $fetch<string>("/variant/article");
      expect(extractJson(html, "config")).toEqual({
        hasDate: false,
        theme: { color: "green", density: "comfortable", tokens: ["article"] },
        slots: ["app-article"],
        collision: "article",
        indexed: true,
        seoScore: 90,
        fullscreen: true,
        columns: 2,
      });
    });

    it("app.config override wins over nuxt.config base entry", async () => {
      const html = await $fetch<string>("/variant/article");
      const config = extractJson(html, "config") as Record<string, unknown>;
      expect(config.hasDate).toBe(false);
      expect(config.theme).toEqual({
        color: "green",
        density: "comfortable",
        tokens: ["article"],
      });
      expect(config.slots).toEqual(["app-article"]);
    });

    it("resolves shorthand array registry entry", async () => {
      const html = await $fetch<string>("/variant/event");
      expect(extractJson(html, "config")).toEqual({
        indexed: true,
        seoScore: 90,
        fullscreen: true,
        columns: 2,
      });
    });

    it("normalizes string extends input", async () => {
      const html = await $fetch<string>("/variant/gallery");
      expect(extractJson(html, "config")).toEqual({
        layout: "gallery",
        fullscreen: true,
        columns: 2,
      });
    });

    it("app.config replaces the extends chain for a base variant", async () => {
      const html = await $fetch<string>("/variant/editorial");
      expect(extractJson(html, "config")).toEqual({
        tone: "app",
        fullscreen: true,
        columns: 2,
      });
      expect(extractJson(html, "has-seo")).toBe(false);
      expect(extractJson(html, "has-hero")).toBe(true);
    });

    it("resolves app.config-only variant not in nuxt.config registry", async () => {
      const html = await $fetch<string>("/variant/extra");
      expect(extractJson(html, "config")).toEqual({ custom: 42 });
    });

    it("returns empty config for inactive and unknown variants", async () => {
      const inactive = await $fetch<string>("/variant/inactive");
      const unknown = await $fetch<string>("/variant/nonexistent");
      expect(extractJson(inactive, "config")).toEqual({});
      expect(extractJson(unknown, "config")).toEqual({});
    });
  });

  describe("useVariant() has()", () => {
    it("returns true when the variant is the queried feature itself", async () => {
      const html = await $fetch<string>("/variant/seo");
      expect(extractJson(html, "has-seo")).toBe(true);
    });

    it("returns false when variant does not extend the queried feature", async () => {
      const html = await $fetch<string>("/variant/seo");
      expect(extractJson(html, "has-hero")).toBe(false);
    });

    it("detects direct and transitive parents", async () => {
      const html = await $fetch<string>("/variant/article");
      expect(extractJson(html, "has-seo")).toBe(true);
      expect(extractJson(html, "has-hero")).toBe(true);
      expect(extractJson(html, "has-design")).toBe(true);
    });

    it("detects parents from shorthand and string extends entries", async () => {
      const event = await $fetch<string>("/variant/event");
      const gallery = await $fetch<string>("/variant/gallery");
      expect(extractJson(event, "has-seo")).toBe(true);
      expect(extractJson(event, "has-hero")).toBe(true);
      expect(extractJson(gallery, "has-hero")).toBe(true);
    });
  });

  describe("useVariants()", () => {
    it("lists variants from both nuxt.config registry and app.config", async () => {
      const html = await $fetch<string>("/variants");
      const variants = extractJson(html, "variants") as Array<{ name: string }>;
      const names = variants.map((v) => v.name);

      expect(names).toEqual([
        "seo",
        "hero",
        "design",
        "article",
        "event",
        "gallery",
        "editorial",
        "inactive",
        "extra",
      ]);
    });

    it("normalizes extends arrays and lets app.config replace base extends", async () => {
      const html = await $fetch<string>("/variants");
      const variants = extractJson(html, "variants") as Array<{
        name: string;
        extends: string[];
        configKeys: string[];
      }>;

      const find = (name: string) => variants.find((v) => v.name === name)!;

      expect(find("seo").extends).toEqual([]);
      expect(find("article").extends).toEqual(["seo", "hero", "design"]);
      expect(find("event").extends).toEqual(["seo", "hero"]);
      expect(find("gallery").extends).toEqual(["hero"]);
      expect(find("editorial").extends).toEqual(["hero"]);
      expect(find("extra").extends).toEqual([]);
    });

    it("lists configKeys from both base and app registries", async () => {
      const html = await $fetch<string>("/variants");
      const variants = extractJson(html, "variants") as Array<{
        name: string;
        configKeys: string[];
      }>;

      const find = (name: string) => variants.find((v) => v.name === name)!;

      expect(find("article").configKeys).toEqual(["hasDate", "theme", "slots", "collision"]);
      expect(find("editorial").configKeys).toEqual(["tone"]);
      expect(find("extra").configKeys).toEqual(["custom"]);
    });
  });

  describe("Nuxt DevTools", () => {
    it("serves the client app and variant inspector data in dev", async () => {
      const html = await $fetch<string>("/__nuxt-variants/devtools");
      expect(html).toContain("<title>Nuxt Variants DevTools</title>");
      expect(html).toContain(
        '<script type="module" src="/__nuxt-variants/devtools/src/main.js"></script>',
      );

      const data = await $fetch<{
        configKey: string;
        variants: Array<{ name: string; activeFeatures: string[] }>;
        diagnostics: unknown[];
      }>("/__nuxt-variants/devtools/data.json");

      expect(data.configKey).toBe("variants");
      expect(data.diagnostics).toEqual([]);
      expect(data.variants.find((variant) => variant.name === "article")).toMatchObject({
        activeFeatures: ["seo", "hero", "design", "article"],
      });

      const client = await $fetch<string>("/__nuxt-variants/devtools/src/main.js");
      expect(client).toContain('fetch("/__nuxt-variants/devtools/data.json")');
    });
  });
});
