import { describe, expect, it } from "vitest";
import { createVariantSnapshot } from "../../src/runtime/utils/devtools";

const metadata = {
  configKey: "variants",
  registry: {
    content: { config: { toc: true, width: "prose" } },
    article: { extends: "content", config: { sharing: true } },
  },
  sources: {
    content: [
      {
        name: "foundation",
        kind: "layer" as const,
        entry: { config: { toc: true, width: "prose" } },
      },
    ],
  },
};

describe("createVariantSnapshot", () => {
  it("resolves the current app-config overrides for every snapshot", () => {
    const initial = createVariantSnapshot(metadata, {
      content: { config: { toc: false } },
    });
    const updated = createVariantSnapshot(metadata, {
      content: { config: { toc: true, width: "wide" } },
    });

    expect(initial.variants.find(({ name }) => name === "article")?.resolvedConfig).toEqual({
      sharing: true,
      toc: false,
      width: "prose",
    });
    expect(updated.variants.find(({ name }) => name === "article")?.resolvedConfig).toEqual({
      sharing: true,
      toc: true,
      width: "wide",
    });
  });

  it("reports invalid overrides without hiding the registry", () => {
    const data = createVariantSnapshot(metadata, {
      missing: { config: { enabled: true } },
    });

    expect(data.variants.map(({ name }) => name)).toEqual(["content", "article"]);
    expect(data.diagnostics).toMatchObject([
      { code: "unknown-runtime-override", variant: "missing" },
    ]);
  });
});
