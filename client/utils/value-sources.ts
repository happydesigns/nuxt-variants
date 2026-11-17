import type { VariantDevtoolsEntry } from "../../src/runtime/utils/devtools";
import {
  resolveVariantConfigFromLineage,
  type VariantRegistry,
} from "../../src/runtime/utils/variants";

export interface ValueSource {
  path: string[];
  value: unknown;
  variant: string;
  input: "Registry default" | "App config override";
}

// Keep object boundaries and null fallback intact. Arrays are atomic in the
// resolver, so an array and a scalar can both carry a single source index.
function markValues(config: Record<string, unknown>, index: number): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      value == null
        ? value
        : typeof value === "object" && !Array.isArray(value)
          ? markValues(value as Record<string, unknown>, index)
          : index,
    ]),
  );
}

export function getValueSources(
  selected: VariantDevtoolsEntry,
  entries: readonly VariantDevtoolsEntry[],
): ValueSource[] {
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const registry: VariantRegistry = Object.create(null);
  const overrides: VariantRegistry = Object.create(null);
  const sources: Pick<ValueSource, "variant" | "input">[] = [];
  for (const name of selected.activeFeatures) {
    const entry = byName.get(name);
    if (!entry) return [];
    const index = sources.length;
    sources.push(
      { variant: name, input: "Registry default" },
      { variant: name, input: "App config override" },
    );
    registry[name] = {
      extends: entry.extends,
      config: markValues(entry.base?.config ?? {}, index),
    };
    overrides[name] = { config: markValues(entry.app?.config ?? {}, index + 1) };
  }
  const markers = resolveVariantConfigFromLineage(selected.activeFeatures, registry, overrides);
  const rows: ValueSource[] = [];
  function visit(tree: Record<string, unknown>, values: Record<string, unknown>, path: string[]) {
    for (const [key, marker] of Object.entries(tree)) {
      const field = [...path, key];
      const value = values[key];
      if (typeof marker === "number") rows.push({ path: field, value, ...sources[marker]! });
      else if (marker && typeof marker === "object" && value && typeof value === "object")
        visit(marker as Record<string, unknown>, value as Record<string, unknown>, field);
    }
  }
  visit(markers, selected.resolvedConfig, []);
  return rows;
}
