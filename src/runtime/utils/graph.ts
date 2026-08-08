export type VariantGraphEntryInput =
  | readonly string[]
  | {
      extends?: string | readonly string[];
      active?: boolean;
      config?: unknown;
    };

export type VariantGraphRegistry = Record<string, VariantGraphEntryInput>;

/** Builds the inheritance graph consumed by schema resolution and tooling. */
export function createVariantGraph(registry: VariantGraphRegistry): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(registry).map(([name, entry]) => {
      const extendsValue = "extends" in entry ? entry.extends : entry;
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
