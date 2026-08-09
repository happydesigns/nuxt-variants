import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { setup, $fetch, useTestContext } from "@nuxt/test-utils/e2e";

function extractJson(html: string, id: string): unknown {
  const match = html.match(new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)<\\/`));
  if (!match) throw new Error(`Element #${id} not found in HTML`);
  return JSON.parse(match[1]!.replace(/&quot;/g, '"'));
}

const fixtureRoot = fileURLToPath(new URL("./fixtures/layer-consumer", import.meta.url));

describe("Nuxt layer composition", async () => {
  await setup({
    rootDir: fixtureRoot,
  });

  it("uses Nuxt's merged AppConfig type without importing app config files", () => {
    const buildDir = useTestContext().nuxt!.options.buildDir;
    const generatedTypes = readFileSync(join(buildDir, "types/nuxt-variants.d.ts"), "utf8");

    expect(generatedTypes).toContain('"article": { config: { "kind": string } }');
    expect(generatedTypes).toContain('_VariantConfigWithOverride<"content"');
    expect(generatedTypes).toContain("import type { AppConfig } from 'nuxt/schema'");
    expect(generatedTypes).toContain("_VariantConfig<_AppVariants extends Record");
    expect(generatedTypes).not.toMatch(/import cfg\d+ from/);
    expect(generatedTypes).not.toContain("defineAppConfig");
  });

  it("combines layer and consumer registry entries into one graph", async () => {
    const html = (await $fetch("/")) as string;

    expect(extractJson(html, "features")).toEqual(["header", "content", "article"]);
    expect(extractJson(html, "config")).toEqual({
      consumer: true,
      visible: true,
      width: "wide",
      kind: "article",
    });
    expect(
      (extractJson(html, "variants") as Array<{ name: string }>).map((entry) => entry.name),
    ).toEqual(["header", "content", "article"]);
  });

  it("reports where each registry entry was declared", async () => {
    const data = await $fetch<{
      variants: Array<{
        name: string;
        sources: Array<{ name: string; kind: string }>;
      }>;
    }>("/__nuxt-variants/devtools/data.json");

    expect(data.variants.find(({ name }) => name === "header")?.sources).toEqual([
      { name: "layer-base", kind: "layer", entry: { config: { visible: true } } },
    ]);
    expect(data.variants.find(({ name }) => name === "article")?.sources).toEqual([
      {
        name: "Application",
        kind: "application",
        entry: { extends: ["content"], config: { kind: "article" } },
      },
    ]);
    expect(data.variants.find(({ name }) => name === "content")?.sources).toEqual([
      {
        name: "Application",
        kind: "application",
        entry: { config: { consumer: true } },
      },
      {
        name: "layer-base",
        kind: "layer",
        entry: { extends: ["header"], config: { width: "prose" } },
      },
    ]);
  });
});
