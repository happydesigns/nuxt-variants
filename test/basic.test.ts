import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("default Nuxt module configuration", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)),
  });

  it("exposes an empty registry during SSR without any module options", async () => {
    const html = await $fetch("/");
    expect(html).toContain("<p>0 variants</p>");
  });
});
