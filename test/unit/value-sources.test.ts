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
  it("shows empty objects and null fields without a fabricated scalar source", () => {
    const { variants } = createVariantDevtoolsData(
      {
        configKey: "variants",
        registry: {
          record: { config: { empty: {}, shared: {}, nested: { value: null }, items: [] } },
        },
        sources: {},
      },
      { record: { config: { shared: {} } } },
    );
    const rows = getValueSources(variants[0]!, variants);
    const origin = { variant: "record", input: "Registry default" };
    expect(rows).toContainEqual({ path: ["empty"], value: {}, ...origin });
    expect(rows).toContainEqual({ path: ["nested", "value"], value: null, ...origin });
    expect(rows).toContainEqual({ path: ["shared"], value: {} });
    expect(rows).toContainEqual({
      path: ["items"],
      value: [],
      variant: "record",
      input: "Registry default",
    });
  });
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
