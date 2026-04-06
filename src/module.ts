import { defineNuxtModule, addImportsDir, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  registry: Record<string, unknown>
  configKey: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-variants',
    configKey: 'variants',
  },
  defaults: {
    registry: {},
    configKey: 'variants',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.variantRegistry = options.registry
    nuxt.options.runtimeConfig.public.variantsConfigKey = options.configKey

    addImportsDir(resolver.resolve('./runtime/composables'))
    addImportsDir(resolver.resolve('./runtime/utils'))
  },
})
