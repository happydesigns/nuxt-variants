export type VariantGraphEntryInput =
  | readonly string[]
  | {
      extends?: string | readonly string[];
      active?: boolean;
      config?: unknown;
    };

export type VariantGraphRegistry = Record<string, VariantGraphEntryInput>;

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
