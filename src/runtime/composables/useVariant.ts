import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { useAppConfig } from "#app";
import { variantRegistry, variantResolutionPlan, variantsConfigKey } from "#variants-runtime";
import {
  createVariantResolutionPlan,
  hasVariantActivityOverrides,
  resolveVariantConfigFromPlan,
  type VariantOverrideRegistry,
  type VariantRegistryEntry,
  type VariantRegistry,
} from "../utils/variants";
import type { CustomVariantRegistry, VariantName, VariantNameInput } from "#nuxt-variants";

export type { CustomVariantRegistry, VariantName, VariantNameInput };
export type VariantDefinition<TConfig extends object = Record<string, unknown>> =
  VariantRegistryEntry<TConfig>;

type KeysOfUnion<U> = U extends unknown ? keyof U : never;
type ValueForKey<U, K extends PropertyKey> = U extends unknown
  ? K extends keyof U
    ? U[K]
    : never
  : never;

export type MergeVariantConfigUnion<U> = {
  [K in KeysOfUnion<U>]?: ValueForKey<U, K>;
};

type AnyVariantConfig = keyof CustomVariantRegistry extends never
  ? Record<string, unknown>
  : MergeVariantConfigUnion<CustomVariantRegistry[keyof CustomVariantRegistry]>;

/**
 * The resolved config type for a variant key (or union of keys).
 *
 * @example
 * type Config = VariantConfigOf<'article'>
 * // → Partial<ArticleConfig>
 */
export type VariantConfigOf<K extends keyof CustomVariantRegistry> = MergeVariantConfigUnion<
  CustomVariantRegistry[K]
>;

export interface UseVariantReturn<TConfig> {
  /** The fully merged configuration object for this variant. */
  config: ComputedRef<TConfig>;
  /** The active variant and its complete active inheritance chain. */
  features: ComputedRef<ReadonlySet<string>>;
  /**
   * Returns a computed ref that is `true` if this is the selected variant or
   * if it directly or transitively extends the given feature name.
   */
  has: (featureName: MaybeRefOrGetter<VariantNameInput>) => ComputedRef<boolean>;
}

/**
 * Reactively resolves a named variant, returning its merged config and a
 * helper to check inheritance.
 *
 * @example
 * const { config, has } = useVariant('blog')
 * has('seo')   // ComputedRef<true>
 *
 * @param name - The variant key to resolve, typed against the generated registry and optional `CustomVariantOverrides`.
 */
export function useVariant<K extends keyof CustomVariantRegistry>(
  name: MaybeRefOrGetter<K>,
): UseVariantReturn<VariantConfigOf<K>>;
export function useVariant(name: MaybeRefOrGetter<string>): UseVariantReturn<AnyVariantConfig>;
export function useVariant(name: MaybeRefOrGetter<string>): UseVariantReturn<unknown> {
  const appConfig = useAppConfig();

  function getRegistries() {
    const baseRegistry = variantRegistry as VariantRegistry;
    const overrideRegistry = ((appConfig as Record<string, unknown>)[variantsConfigKey] ??
      {}) as VariantOverrideRegistry;
    return { baseRegistry, overrideRegistry };
  }

  const resolutionPlan = computed(() => {
    const { baseRegistry, overrideRegistry } = getRegistries();
    return hasVariantActivityOverrides(overrideRegistry)
      ? createVariantResolutionPlan(baseRegistry, overrideRegistry)
      : variantResolutionPlan;
  });

  const config = computed(() => {
    const { baseRegistry, overrideRegistry } = getRegistries();
    const variantName = toValue(name) as string;

    return resolveVariantConfigFromPlan(
      variantName,
      baseRegistry,
      overrideRegistry,
      resolutionPlan.value,
    ) as unknown;
  });

  const features = computed(() => {
    const variantName = toValue(name) as string;
    return new Set<string>(resolutionPlan.value[variantName] ?? []);
  });

  function has(featureName: MaybeRefOrGetter<VariantNameInput>): ComputedRef<boolean> {
    return computed(() => features.value.has(toValue(featureName)));
  }

  return { config, features, has };
}
