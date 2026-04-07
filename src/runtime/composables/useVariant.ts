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

type VariantName = keyof CustomVariantRegistry extends never
  ? string
  : keyof CustomVariantRegistry | string;

type VariantConfigOf<K extends VariantName> = K extends keyof CustomVariantRegistry
  ? Partial<CustomVariantRegistry[K]>
  : Record<string, unknown>;

/**
 * Reactively resolves a named variant by merging its configuration with all
 * inherited parent variants. The returned computed ref updates automatically
 * when `app.config` changes (e.g. via Nuxt Studio), without a page reload.
 *
 * Accepts a plain string or any ref/getter so the name itself can be reactive.
 *
 * To enable typed variant resolution, augment `CustomVariantRegistry` in your project:
 * @example
 * declare module '#nuxt-variants' {
 *   interface CustomVariantRegistry {
 *     myButton: { size: 'sm' | 'lg', rounded: boolean }
 *   }
 * }
 *
 * @param name - The variant key to resolve, typed against `CustomVariantRegistry` when augmented.
 * @returns A computed ref of the fully merged configuration object, or an empty object if the variant is inactive or not found.
 */
export function useVariant<K extends VariantName>(
  name: MaybeRefOrGetter<K>,
): ComputedRef<VariantConfigOf<K>> {
  const runtimeConfig = useRuntimeConfig();
  const appConfig = useAppConfig();

  return computed(() => {
    const resolvedName = toValue(name) as string;
    const configKey = runtimeConfig.public.variantsConfigKey as string;
    const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<
      string,
      VariantDefinition<unknown>
    >;
    const overrideRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<
      string,
      VariantDefinition<unknown>
    >;

    function resolve(variantName: string, visited: Set<string>): Record<string, unknown> {
      if (visited.has(variantName)) {
        return {};
      }

      visited.add(variantName);

      const baseEntry = baseRegistry[variantName] as VariantDefinition<unknown> | undefined;
      const overrideEntry = overrideRegistry[variantName] as VariantDefinition<unknown> | undefined;

      if (!baseEntry && !overrideEntry) {
        return {};
      }

      const isActive = overrideEntry?.active ?? baseEntry?.active ?? true;
      if (isActive === false) {
        return {};
      }

      const extendsFrom = overrideEntry?.extends ?? baseEntry?.extends;
      const parentNames =
        extendsFrom === undefined ? [] : Array.isArray(extendsFrom) ? extendsFrom : [extendsFrom];

      const resolvedParents = parentNames.reduceRight<Record<string, unknown>>(
        (acc, parentName) => defuReplaceArray(acc, resolve(parentName, new Set(visited))),
        {},
      );

      const mergedConfig = defuReplaceArray(
        {},
        (overrideEntry?.config ?? {}) as Record<string, unknown>,
        (baseEntry?.config ?? {}) as Record<string, unknown>,
      );

      return defuReplaceArray({}, mergedConfig, resolvedParents);
    }

    return resolve(resolvedName, new Set()) as VariantConfigOf<K>;
  });
}
