import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

function extractJson(html: string, id: string): unknown {
  const match = html.match(new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)<\\/`));
  if (!match) throw new Error(`Element #${id} not found in HTML`);
  return JSON.parse(match[1]!.replace(/&quot;/g, '"'));
}

describe("Nuxt layer composition", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/layer-consumer", import.meta.url)),
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
