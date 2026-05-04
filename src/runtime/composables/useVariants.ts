import { computed, type ComputedRef } from "vue";
import { useRuntimeConfig, useAppConfig } from "#app";
import { listVariantEntries, type VariantListEntry, type VariantRegistry } from "../utils/variants";

/**
 * Describes a resolved registry entry as returned by `useVariants`.
 */
export type VariantEntry = VariantListEntry;

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
    const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as VariantRegistry;
    const appRegistry = ((appConfig as Record<string, unknown>)[configKey] ??
      {}) as VariantRegistry;

    return listVariantEntries(baseRegistry, appRegistry);
  });
}
