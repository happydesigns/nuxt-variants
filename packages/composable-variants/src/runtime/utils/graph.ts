import type {
  VariantRegistryEntryInput,
  VariantRegistryEntryShorthand,
  VariantRegistryInput,
} from "./registry";

export type VariantGraphEntryInput = VariantRegistryEntryInput | VariantRegistryEntryShorthand;

export type VariantGraphRegistry = VariantRegistryInput;

/** Immutable build-time inheritance graph keyed by variant name. */
export type VariantGraph = Readonly<Record<string, readonly string[]>>;

function isStringArray(entry: VariantGraphEntryInput): entry is readonly string[] {
  return Array.isArray(entry);
}

/** Builds the inheritance graph consumed by schema resolution and tooling. */
export function createVariantGraph(registry: VariantGraphRegistry): VariantGraph {
  return Object.fromEntries(
    Object.entries(registry).map(([name, entry]) => {
      const extendsValue = isStringArray(entry) ? entry : entry.extends;
      return [
        name,
        extendsValue === undefined
          ? []
          : Array.isArray(extendsValue)
            ? [...extendsValue]
            : [extendsValue],
      ];
    }),
  );
}
