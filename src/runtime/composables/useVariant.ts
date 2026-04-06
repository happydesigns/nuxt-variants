import { useRuntimeConfig, useAppConfig } from '#app'
import { defuReplaceArray } from '../utils/merge'

/**
 * Describes a single variant entry in the registry.
 * @template T The shape of the configuration object this variant produces.
 */
export interface VariantDefinition<T> {
  extends?: string | string[]
  active?: boolean
  config: Partial<T>
}

/**
 * Augment this interface in your consuming project to register named variants
 * and their configuration shapes, enabling strict typing for `useVariant`.
 *
 * @example
 * declare module 'nuxt-variants' {
 *   interface CustomVariantRegistry {
 *     myButton: ButtonProps
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomVariantRegistry {}

type VariantName = keyof CustomVariantRegistry extends never
  ? string
  : keyof CustomVariantRegistry | string

type VariantConfigOf<K extends VariantName> = K extends keyof CustomVariantRegistry
  ? Partial<CustomVariantRegistry[K]>
  : Record<string, unknown>

/**
 * Resolves a named variant by merging its configuration with all inherited
 * parent variants, giving priority to `app.config` overrides over `nuxt.config`
 * base definitions.
 *
 * @param name - The variant key to resolve, typed against `CustomVariantRegistry` when augmented.
 * @returns The fully merged configuration object for the variant, or an empty object if the variant is inactive or not found.
 */
export function useVariant<K extends VariantName>(name: K): VariantConfigOf<K> {
  const runtimeConfig = useRuntimeConfig()
  const appConfig = useAppConfig()

  const configKey = runtimeConfig.public.variantsConfigKey as string
  const baseRegistry = (runtimeConfig.public.variantRegistry ?? {}) as Record<string, VariantDefinition<unknown>>
  const overrideRegistry = ((appConfig as Record<string, unknown>)[configKey] ?? {}) as Record<string, VariantDefinition<unknown>>

  function resolve(variantName: string, visited: Set<string>): Record<string, unknown> {
    if (visited.has(variantName)) {
      return {}
    }

    visited.add(variantName)

    const baseEntry = baseRegistry[variantName] as VariantDefinition<unknown> | undefined
    const overrideEntry = overrideRegistry[variantName] as VariantDefinition<unknown> | undefined

    if (!baseEntry && !overrideEntry) {
      return {}
    }

    const isActive = overrideEntry?.active ?? baseEntry?.active ?? true
    if (isActive === false) {
      return {}
    }

    const extendsFrom = overrideEntry?.extends ?? baseEntry?.extends
    const parentNames = extendsFrom === undefined
      ? []
      : Array.isArray(extendsFrom)
        ? extendsFrom
        : [extendsFrom]

    const resolvedParents = parentNames.reduceRight<Record<string, unknown>>(
      (acc, parentName) => defuReplaceArray(acc, resolve(parentName, new Set(visited))),
      {},
    )

    const mergedConfig = defuReplaceArray(
      {},
      (overrideEntry?.config ?? {}) as Record<string, unknown>,
      (baseEntry?.config ?? {}) as Record<string, unknown>,
    )

    return defuReplaceArray({}, mergedConfig, resolvedParents)
  }

  return resolve(name as string, new Set()) as VariantConfigOf<K>
}
