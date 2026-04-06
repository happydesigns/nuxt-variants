import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useRuntimeConfig, useAppConfig } from '#app'
import type { VariantDefinition } from './useVariant'

/**
 * Reactively checks whether a variant directly or transitively extends a given
 * feature name by walking the full `extends` chain in the registry.
 * The returned computed ref updates automatically when `app.config` changes.
 *
 * @param variantName - The variant to inspect. Accepts a plain string or any ref/getter.
 * @param featureName - The feature name to search for in the extension chain.
 * @returns A computed ref that is `true` if the variant inherits from the feature at any depth.
 */
export function useVariantExtends(variantName: MaybeRefOrGetter<string>, featureName: MaybeRefOrGetter<string>): ComputedRef<boolean> {
  const runtimeConfig = useRuntimeConfig()
  const appConfig = useAppConfig()

  return computed(() => {
    const resolvedVariantName = toValue(variantName)
    const resolvedFeatureName = toValue(featureName)
    const configKey = runtimeConfig.public.variantsConfigKey as string
    const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<string, VariantDefinition<unknown>>
    const overrideRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<string, VariantDefinition<unknown>>

    function check(name: string, visited: Set<string>): boolean {
      if (name === resolvedFeatureName) return true
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

    return check(resolvedVariantName, new Set())
  })
}
