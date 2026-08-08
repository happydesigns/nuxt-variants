import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { useRuntimeConfig, useAppConfig } from "#app";
import {
  resolveVariantConfig,
  variantHasFeature,
  type VariantRegistryEntry,
  type VariantRegistry,
} from "../utils/variants";
import type { CustomVariantRegistry } from "#nuxt-variants";

export type { CustomVariantRegistry };
export type VariantDefinition<T = unknown> = VariantRegistryEntry<T>;

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
  /**
   * Returns a computed ref that is `true` if this variant directly or
   * transitively extends the given feature name.
   */
  has: (featureName: MaybeRefOrGetter<string>) => ComputedRef<boolean>;
}

/**
 * Reactively resolves a named variant, returning its merged config and a
 * helper to check inheritance.
 *
 * @example
 * const { config, has } = useVariant('blog')
 * has('seo')   // ComputedRef<true>
 *
 * @param name - The variant key to resolve, typed against `CustomVariantRegistry` when augmented.
 */
export function useVariant<K extends keyof CustomVariantRegistry>(
  name: MaybeRefOrGetter<K>,
): UseVariantReturn<VariantConfigOf<K>>;
export function useVariant(name: MaybeRefOrGetter<string>): UseVariantReturn<AnyVariantConfig>;
export function useVariant(name: MaybeRefOrGetter<string>): UseVariantReturn<unknown> {
  const runtimeConfig = useRuntimeConfig();
  const appConfig = useAppConfig();

  function getRegistries() {
    const configKey = runtimeConfig.public.variantsConfigKey as string;
    const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as VariantRegistry;
    const overrideRegistry = ((appConfig as Record<string, unknown>)[configKey] ??
      {}) as VariantRegistry;
    return { baseRegistry, overrideRegistry };
  }

  const config = computed(() => {
    const { baseRegistry, overrideRegistry } = getRegistries();
    return resolveVariantConfig(toValue(name) as string, baseRegistry, overrideRegistry) as unknown;
  });

  function has(featureName: MaybeRefOrGetter<string>): ComputedRef<boolean> {
    return computed(() => {
      const { baseRegistry, overrideRegistry } = getRegistries();
      const target = toValue(featureName);
      return variantHasFeature(toValue(name) as string, target, baseRegistry, overrideRegistry);
    });
  }

  return { config, has };
}
