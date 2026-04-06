import { useRuntimeConfig, useAppConfig } from '#app'
import type { VariantDefinition } from './useVariant'

/**
 * Checks whether a variant directly or transitively extends a given feature name
 * by walking the full `extends` chain in the registry.
 *
 * @param variantName - The variant to inspect.
 * @param featureName - The feature name to search for in the extension chain.
 * @returns `true` if the variant inherits from the feature at any depth.
 */
export function useVariantExtends(variantName: string, featureName: string): boolean {
  const runtimeConfig = useRuntimeConfig()
  const appConfig = useAppConfig()

  const configKey = runtimeConfig.public.variantsConfigKey as string
  const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<string, VariantDefinition<unknown>>
  const overrideRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<string, VariantDefinition<unknown>>

  function check(name: string, visited: Set<string>): boolean {
    if (name === featureName) return true
    if (visited.has(name)) return false

    visited.add(name)

    const baseEntry = baseRegistry[name]
    const overrideEntry = overrideRegistry[name]
    const extendsFrom = overrideEntry?.extends ?? baseEntry?.extends
    const parents = extendsFrom === undefined
      ? []
      : Array.isArray(extendsFrom) ? extendsFrom : [extendsFrom]

    return parents.some(parent => check(parent, new Set(visited)))
  }

  return check(variantName, new Set())
}
