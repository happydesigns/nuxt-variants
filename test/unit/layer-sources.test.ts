import { describe, expect, it } from "vitest";
import { collectVariantSources } from "../../src/utils/layer-sources";

describe("collectVariantSources", () => {
  it("reports application and named layer contributions in precedence order", () => {
    const sources = collectVariantSources(
      [
        {
          cwd: "/project",
          config: {
            variants: { registry: { article: { extends: ["content"] } } },
          },
        },
        {
          cwd: "/layers/foundation",
          config: {
            $meta: { name: "foundation" },
            variants: {
              registry: {
                content: { extends: ["header"], config: { width: "prose" } },
                header: {},
              },
            },
          },
        },
      ],
      "variants",
    );

    expect(sources.article).toEqual([
      {
        name: "Application",
        kind: "application",
        entry: { extends: ["content"], config: {} },
      },
    ]);
    expect(sources.content).toEqual([
      {
        name: "foundation",
        kind: "layer",
        entry: { extends: ["header"], config: { width: "prose" } },
      },
    ]);
  });

  it("uses a directory name without exposing its full path", () => {
    const sources = collectVariantSources(
      [
        { config: {} },
        {
          cwd: "C:/work/layers/editorial",
          config: { variants: { registry: { article: {} } } },
        },
      ],
      "variants",
    );

    expect(sources.article?.[0]?.name).toBe("editorial");
    expect(JSON.stringify(sources)).not.toContain("C:/work");
  });
});
