import { describe, expect, it } from "vitest";
import { serializeConfigShape } from "../../src/utils/type-serialization";

describe("serializeConfigShape", () => {
  it("quotes property names and preserves nested object shapes", () => {
    expect(
      serializeConfigShape({
        "content-width": "wide",
        nested: { enabled: true },
      }),
    ).toBe('{ "content-width": string; "nested": { "enabled": boolean } }');
  });

  it("infers homogeneous and mixed array element types", () => {
    expect(
      serializeConfigShape({
        tags: ["guide", "release"],
        values: [1, "auto"],
        empty: [],
      }),
    ).toBe('{ "tags": string[]; "values": (number | string)[]; "empty": unknown[] }');
  });
});
