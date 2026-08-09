import { computed, type ComputedRef } from "vue";
import { useAppConfig } from "#app";
import { variantRegistry, variantsConfigKey } from "#variants-runtime";
import {
  listVariantEntries,
  type VariantListEntry,
  type VariantOverrideRegistry,
  type VariantRegistry,
} from "../utils/variants";
import type { VariantName } from "#nuxt-variants";

/**
 * Describes a resolved registry entry as returned by `useVariants`.
 */
export type VariantEntry = Omit<VariantListEntry, "name" | "extends"> & {
  name: VariantName;
  extends: VariantName[];
};

/**
 * Reactively returns a flat list of all variants known to the registry, combining
 * entries from `nuxt.config` (build-time) and `app.config` (runtime).
 * The returned computed ref updates automatically when `app.config` changes.
 */
export function useVariants(): ComputedRef<VariantEntry[]> {
  const appConfig = useAppConfig();

  return computed(() => {
    const baseRegistry = variantRegistry as VariantRegistry;
    const appRegistry = ((appConfig as Record<string, unknown>)[variantsConfigKey] ??
      {}) as VariantOverrideRegistry;

    return listVariantEntries(baseRegistry, appRegistry) as VariantEntry[];
  });
}
