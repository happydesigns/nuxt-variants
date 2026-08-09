import type { VariantEntry } from "../types/devtools";

/** Filters the registry inspector across names, parents, config keys, and layer sources. */
export function filterVariants(variants: VariantEntry[], query: string): VariantEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return variants;

  return variants.filter((variant) =>
    [
      variant.name,
      ...variant.extends,
      ...variant.configKeys,
      ...variant.sources.map(({ name }) => name),
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}
