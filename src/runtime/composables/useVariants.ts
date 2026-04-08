import { computed, type ComputedRef } from "vue";
import { useRuntimeConfig, useAppConfig } from "#app";
import type { VariantDefinition } from "./useVariant";

/**
 * Describes a resolved registry entry as returned by `useVariants`.
 */
export interface VariantEntry {
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

/**
 * Reactively returns a flat list of all variants known to the registry, combining
 * entries from `nuxt.config` (build-time) and `app.config` (runtime).
 * The returned computed ref updates automatically when `app.config` changes.
 */
export function useVariants(): ComputedRef<VariantEntry[]> {
  const runtimeConfig = useRuntimeConfig();
  const appConfig = useAppConfig();

  return computed(() => {
    const configKey = runtimeConfig.public.variantsConfigKey as string;
    const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<
      string,
      VariantDefinition<unknown>
    >;
    const appRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<
      string,
      VariantDefinition<unknown>
    >;

    const keys = new Set([...Object.keys(baseRegistry), ...Object.keys(appRegistry)]);

    return [...keys].map((name) => {
      const base = baseRegistry[name];
      const app = appRegistry[name];

      const resolvedExtends = app?.extends ?? base?.extends;
      const extendsArr =
        resolvedExtends === undefined
          ? []
          : Array.isArray(resolvedExtends)
            ? resolvedExtends
            : [resolvedExtends];

      const configKeys = Object.keys({
        ...base?.config,
        ...app?.config,
      });

      return { name, extends: extendsArr, configKeys };
    });
  });
}
