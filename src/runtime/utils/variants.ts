import { defuReplaceArray } from "./merge";

/**
 * Describes a single variant entry in the registry.
 * @template T The shape of the configuration object this variant produces.
 */
export interface VariantRegistryEntry<TConfig extends object = Record<string, unknown>> {
  extends?: string | string[];
  active?: boolean;
  config?: Partial<TConfig>;
}

export type VariantRegistry = Record<string, VariantRegistryEntry>;

/** Runtime values that may override an existing build-time registry entry. */
export interface VariantRuntimeOverride<TConfig extends object = Record<string, unknown>> {
  active?: boolean;
  config?: Partial<TConfig>;
}

export type VariantOverrideRegistry = Record<string, VariantRuntimeOverride>;

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

/** Parents-first resolution order for every registered variant. */
export type VariantResolutionPlan = Record<string, string[]>;

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

/**
 * Compiles each variant's active inheritance lineage once at build time.
 * Later parents and the selected variant appear later so they retain the
 * documented config priority when the plan is applied from left to right.
 */
export function createVariantResolutionPlan(
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantOverrideRegistry = {},
): VariantResolutionPlan {
  return Object.fromEntries(
    Object.keys(baseRegistry).map((name) => [
      name,
      [...resolveVariantFeatures(name, baseRegistry, overrideRegistry)],
    ]),
  );
}

/** Resolves config from a precompiled parents-first lineage. */
export function resolveVariantConfigFromPlan(
  variantName: string,
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantOverrideRegistry,
  plan: VariantResolutionPlan,
): Record<string, unknown> {
  const lineage = plan[variantName];
  if (!lineage) return {};

  let resolved: Record<string, unknown> = {};

  for (const name of lineage) {
    resolved = defuReplaceArray(
      {},
      (overrideRegistry[name]?.config ?? {}) as Record<string, unknown>,
      (baseRegistry[name]?.config ?? {}) as Record<string, unknown>,
      resolved,
    );
  }

  return resolved;
}

/** Runtime active overrides require graph traversal instead of the static plan. */
export function hasVariantActivityOverrides(overrideRegistry: VariantOverrideRegistry): boolean {
  return Object.values(overrideRegistry).some((entry) => entry.active !== undefined);
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
