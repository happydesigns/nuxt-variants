import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { useRuntimeConfig, useAppConfig } from "#app";
import { defuReplaceArray } from "../utils/merge";
import type { CustomVariantRegistry } from "#nuxt-variants";

export type { CustomVariantRegistry };

/**
 * Describes a single variant entry in the registry.
 * @template T The shape of the configuration object this variant produces.
 */
export interface VariantDefinition<T> {
  extends?: string | string[];
  active?: boolean;
  config: Partial<T>;
}

type AnyVariantConfig = Record<string, unknown>;

/**
 * The resolved config type for a variant key (or union of keys).
 *
 * @example
 * type Config = VariantConfigOf<'article'>
 * // → Partial<ArticleConfig>
 */
export type VariantConfigOf<K extends keyof CustomVariantRegistry> = Partial<CustomVariantRegistry[K]>;

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
    const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<
      string,
      VariantDefinition<unknown>
    >;
    const overrideRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<
      string,
      VariantDefinition<unknown>
    >;
    return { baseRegistry, overrideRegistry };
  }

  function resolve(
    variantName: string,
    baseRegistry: Record<string, VariantDefinition<unknown>>,
    overrideRegistry: Record<string, VariantDefinition<unknown>>,
    visited: Set<string>,
  ): Record<string, unknown> {
    if (visited.has(variantName)) return {};
    visited.add(variantName);

    const baseEntry = baseRegistry[variantName];
    const overrideEntry = overrideRegistry[variantName];

    if (!baseEntry && !overrideEntry) return {};

    const isActive = overrideEntry?.active ?? baseEntry?.active ?? true;
    if (isActive === false) return {};

    const extendsFrom = overrideEntry?.extends ?? baseEntry?.extends;
    const parentNames =
      extendsFrom === undefined ? [] : Array.isArray(extendsFrom) ? extendsFrom : [extendsFrom];

    const resolvedParents = parentNames.reduceRight<Record<string, unknown>>(
      (acc, parentName) =>
        defuReplaceArray(
          acc,
          resolve(parentName, baseRegistry, overrideRegistry, new Set(visited)),
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

  const config = computed(() => {
    const { baseRegistry, overrideRegistry } = getRegistries();
    return resolve(
      toValue(name) as string,
      baseRegistry,
      overrideRegistry,
      new Set(),
    ) as unknown;
  });

  function has(featureName: MaybeRefOrGetter<string>): ComputedRef<boolean> {
    return computed(() => {
      const { baseRegistry, overrideRegistry } = getRegistries();
      const target = toValue(featureName);

      function check(variantName: string, visited: Set<string>): boolean {
        if (variantName === target) return true;
        if (visited.has(variantName)) return false;
        visited.add(variantName);

        const baseEntry = baseRegistry[variantName];
        const overrideEntry = overrideRegistry[variantName];
        const extendsFrom = overrideEntry?.extends ?? baseEntry?.extends;
        const parents =
          extendsFrom === undefined ? [] : Array.isArray(extendsFrom) ? extendsFrom : [extendsFrom];

        return parents.some((parent) => check(parent, new Set(visited)));
      }

      return check(toValue(name) as string, new Set());
    });
  }

  return { config, has };
}
