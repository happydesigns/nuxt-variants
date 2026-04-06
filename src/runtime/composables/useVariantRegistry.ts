import { useRuntimeConfig, useAppConfig } from '#app'
import type { VariantDefinition } from './useVariant'

/** Where in the configuration stack a variant is defined. */
export type VariantSource = 'nuxt.config' | 'app.config' | 'both'

/**
 * Describes a resolved registry entry as returned by `useVariantRegistry`.
 */
export interface RegistryEntry {
  /** The variant's key in the registry. */
  name: string
  /**
   * The resolved `extends` chain (from `app.config` if present, otherwise `nuxt.config`).
   * An empty array means this is a base feature with no parents.
   */
  extends: string[]
  /** Where the variant is defined. `'both'` means `app.config` overrides a `nuxt.config` base. */
  source: VariantSource
  /** Union of all config keys defined across both sources. */
  configKeys: string[]
}

/**
 * Returns a flat list of all variants known to the registry, combining
 * entries from `nuxt.config` (build-time) and `app.config` (runtime).
 *
 * Each entry carries its resolved `extends` chain, a `source` discriminant,
 * and the union of config keys defined across both sources.
 */
export function useVariantRegistry(): RegistryEntry[] {
  const runtimeConfig = useRuntimeConfig()
  const appConfig = useAppConfig()

  const configKey = runtimeConfig.public.variantsConfigKey as string
  const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<string, VariantDefinition<unknown>>
  const appRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<string, VariantDefinition<unknown>>

  const keys = new Set([...Object.keys(baseRegistry), ...Object.keys(appRegistry)])

  return [...keys].map((name) => {
    const base = baseRegistry[name]
    const app = appRegistry[name]

    const resolvedExtends = app?.extends ?? base?.extends
    const extendsArr = resolvedExtends === undefined
      ? []
      : Array.isArray(resolvedExtends) ? resolvedExtends : [resolvedExtends]

    const source: VariantSource = base && app ? 'both' : app ? 'app.config' : 'nuxt.config'

    const configKeys = Object.keys({
      ...(base?.config as object ?? {}),
      ...(app?.config as object ?? {}),
    })

    return { name, extends: extendsArr, source, configKeys }
  })
}
