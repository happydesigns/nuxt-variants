import { describe, expect, it } from "vitest";
import { getValueSources } from "../../client/utils/value-sources";
import { createVariantDevtoolsData } from "../../src/runtime/utils/devtools";
import type { VariantOverrideRegistry } from "../../src/runtime/utils/variants";

const registry = {
  root: { config: { nested: { title: "same", keep: true }, list: ["base"], "literal.key": 0 } },
  left: { extends: "root", config: { nested: { title: "left" }, list: ["left"] } },
  right: { extends: "root" },
  page: { extends: ["left", "right"], config: { nested: { local: false } } },
};
function trace(overrides: VariantOverrideRegistry = {}) {
  const { variants } = createVariantDevtoolsData(
    { configKey: "variants", registry, sources: {} },
    overrides,
  );
  return getValueSources(
    variants.find((entry) => entry.name === "page")!,
    variants,
  );
}
describe("inspector value sources", () => {
  it("retains complete-parent precedence and identifies equal-valued overrides", () => {
    expect(trace()).toEqual(
      expect.arrayContaining([
        { path: ["nested", "title"], value: "same", variant: "root", input: "Registry default" },
        { path: ["nested", "local"], value: false, variant: "page", input: "Registry default" },
        { path: ["list"], value: ["base"], variant: "root", input: "Registry default" },
        { path: ["literal.key"], value: 0, variant: "root", input: "Registry default" },
      ]),
    );
    const changed = trace({ right: { config: { nested: { title: "same", keep: null } } } });
    expect(changed).toContainEqual({
      path: ["nested", "title"],
      value: "same",
      variant: "right",
      input: "App config override",
    });
    expect(changed).toContainEqual({
      path: ["nested", "keep"],
      value: true,
      variant: "root",
      input: "Registry default",
    });
  });
  it("tracks disabled branches and whole-value replacements", () => {
    expect(trace({ right: { active: false } })).toContainEqual({
      path: ["list"],
      value: ["left"],
      variant: "left",
      input: "Registry default",
    });
    const replaced = trace({ page: { config: { nested: ["only"] } } });
    expect(replaced.filter((row) => row.path[0] === "nested")).toEqual([
      { path: ["nested"], value: ["only"], variant: "page", input: "App config override" },
    ]);
    expect(trace({ page: { active: false } })).toEqual([]);
  });
});
