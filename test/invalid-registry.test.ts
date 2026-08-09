import { fileURLToPath } from "node:url";
import { loadNuxt } from "@nuxt/kit";
import { describe, expect, it } from "vitest";

describe("invalid Nuxt registry", () => {
  it("fails prepare with actionable structured diagnostics", async () => {
    const cwd = fileURLToPath(new URL("./fixtures/invalid-registry", import.meta.url));

    await expect(loadNuxt({ cwd, dev: false, ready: true })).rejects.toMatchObject({
      code: "NUXT_VARIANTS_INVALID_REGISTRY",
      diagnostics: [
        expect.objectContaining({
          code: "unknown-parent",
          variant: "article",
          parent: "missing",
        }),
      ],
    });
  });
});
