import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { $fetch, setup } from "@nuxt/test-utils/e2e";

describe("custom app base URL", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/base-url", import.meta.url)),
  });

  it("serves the inspector and its data below the app base URL", async () => {
    const html = await $fetch<string>("/__nuxt-variants/devtools");
    const data = await $fetch<{ variants: Array<{ name: string }> }>(
      "/__nuxt-variants/devtools/data.json",
    );

    expect(html).toContain("Nuxt Variants DevTools");
    expect(html).toContain("/nested/__nuxt-variants/devtools/_nuxt/");
    expect(data.variants.map(({ name }) => name)).toEqual(["content"]);
  });
});
