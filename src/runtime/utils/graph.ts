import type {
  VariantRegistryEntryInput,
  VariantRegistryEntryShorthand,
  VariantRegistryInput,
} from "./registry";

export type VariantGraphEntryInput = VariantRegistryEntryInput | VariantRegistryEntryShorthand;

export type VariantGraphRegistry = VariantRegistryInput;

function isStringArray(entry: VariantGraphEntryInput): entry is readonly string[] {
  return Array.isArray(entry);
}

/** Builds the inheritance graph consumed by schema resolution and tooling. */
export function createVariantGraph(registry: VariantGraphRegistry): Record<string, string[]> {
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
