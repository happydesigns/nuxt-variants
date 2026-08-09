import { defuReplaceArray } from "./merge";

/**
 * Describes a single variant entry in the registry.
 * @template T The shape of the configuration object this variant produces.
 */
export interface VariantRegistryEntry<T = unknown> {
  extends?: string | string[];
  active?: boolean;
  config?: Partial<T>;
}

export type VariantRegistry = Record<string, VariantRegistryEntry<unknown>>;

/** Runtime values that may override an existing build-time registry entry. */
export interface VariantRuntimeOverride<T = unknown> {
  active?: boolean;
  config?: Partial<T>;
}

export type VariantOverrideRegistry = Record<string, VariantRuntimeOverride<unknown>>;

export interface VariantListEntry {
  /** The variant's key in the registry. */
  name: string;
  /**
   * The resolved `extends` chain (from `app.config` if present, otherwise `nuxt.config`).
   * An empty array means this is a base feature with no parents.
   */
  extends: string[];
  /** Union of all config keys defined across both sources. */
  configKeys: string[];
}

export function normalizeExtends(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function getVariantExtends(variantName: string, baseRegistry: VariantRegistry): string[] {
  return normalizeExtends(baseRegistry[variantName]?.extends);
}

export function resolveVariantConfig(
  variantName: string,
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantOverrideRegistry,
  visited = new Set<string>(),
): Record<string, unknown> {
  if (visited.has(variantName)) return {};
  visited.add(variantName);

  const baseEntry = baseRegistry[variantName];
  const overrideEntry = overrideRegistry[variantName];

  if (!baseEntry && !overrideEntry) return {};

  const isActive = overrideEntry?.active ?? baseEntry?.active ?? true;
  if (isActive === false) return {};

  const resolvedParents = getVariantExtends(variantName, baseRegistry).reduceRight<
    Record<string, unknown>
  >(
    (acc, parentName) =>
      defuReplaceArray(
        acc,
        resolveVariantConfig(parentName, baseRegistry, overrideRegistry, new Set(visited)),
      ),
    {},
  );

  const mergedConfig = defuReplaceArray(
    {},
    (overrideEntry?.config ?? {}) as Record<string, unknown>,
    (baseEntry?.config ?? {}) as Record<string, unknown>,
  );

  return defuReplaceArray({}, mergedConfig, resolvedParents);
}

export function variantHasFeature(
  variantName: string,
  featureName: string,
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantOverrideRegistry,
): boolean {
  return resolveVariantFeatures(variantName, baseRegistry, overrideRegistry).has(featureName);
}

/** Resolves the active variant and its complete active inheritance chain once. */
export function resolveVariantFeatures(
  variantName: string,
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantOverrideRegistry,
  visited = new Set<string>(),
): ReadonlySet<string> {
  if (visited.has(variantName)) return new Set();
  visited.add(variantName);

  const baseEntry = baseRegistry[variantName];
  const overrideEntry = overrideRegistry[variantName];
  if (!baseEntry && !overrideEntry) return new Set();

  const isActive = overrideEntry?.active ?? baseEntry?.active ?? true;
  if (isActive === false) return new Set();

  const features = new Set<string>();

  for (const parent of getVariantExtends(variantName, baseRegistry)) {
    for (const feature of resolveVariantFeatures(
      parent,
      baseRegistry,
      overrideRegistry,
      new Set(visited),
    )) {
      features.add(feature);
    }
  }

  features.add(variantName);
  return features;
}

export function listVariantEntries(
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantOverrideRegistry,
): VariantListEntry[] {
  const keys = Object.keys(baseRegistry);

  return keys.map((name) => {
    const base = baseRegistry[name];
    const app = overrideRegistry[name];

    const configKeys = Object.keys({
      ...base?.config,
      ...app?.config,
    });

    return {
      name,
      extends: getVariantExtends(name, baseRegistry),
      configKeys,
    };
  });
}
