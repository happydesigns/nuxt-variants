/** A complete build-time variant entry. */
export interface VariantRegistryEntryInput<TConfig = Record<string, unknown>> {
  extends?: string | readonly string[];
  active?: boolean;
  config?: TConfig;
}

/** Array shorthand for an entry that only extends other registry entries. */
export type VariantRegistryEntryShorthand = readonly string[];

/** Input accepted by the build-time variant registry. */
export type VariantRegistryInput = Record<
  string,
  VariantRegistryEntryInput | VariantRegistryEntryShorthand
>;

/** Normalized build-time entry used by runtime and tooling internals. */
export interface NormalizedVariantRegistryEntry {
  extends?: string | string[];
  active?: boolean;
  config: Record<string, unknown>;
}

export type NormalizedVariantRegistry = Record<string, NormalizedVariantRegistryEntry>;

function isRegistryShorthand(
  entry: VariantRegistryEntryInput | VariantRegistryEntryShorthand,
): entry is VariantRegistryEntryShorthand {
  return Array.isArray(entry);
}

function normalizeExtendsInput(
  value: string | readonly string[] | undefined,
): string | string[] | undefined {
  return typeof value === "string" || value === undefined ? value : [...value];
}

/**
 * Defines a shared variant registry while preserving literal names and values.
 *
 * Runtime validation intentionally checks parent names after Nuxt has composed
 * all layers. A single layer may validly extend a parent supplied by another
 * layer, so local-only validation would reject legitimate registries.
 */
export function defineVariantRegistry<const TRegistry extends VariantRegistryInput>(
  registry: TRegistry,
): TRegistry {
  return registry;
}

/** Converts shorthand and omitted config values into one internal shape. */
export function normalizeVariantRegistry(
  registry: VariantRegistryInput,
): NormalizedVariantRegistry {
  return Object.fromEntries(
    Object.entries(registry).map(([name, entry]) => [
      name,
      isRegistryShorthand(entry)
        ? { extends: [...entry], config: {} }
        : {
            ...entry,
            extends: normalizeExtendsInput(entry.extends),
            config: entry.config ?? {},
          },
    ]),
  );
}
