import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  defineNuxtModule,
  addImportsDir,
  addTypeTemplate,
  addTemplate,
  addServerHandler,
  createResolver,
} from "@nuxt/kit";
import { addCustomTab } from "@nuxt/devtools-kit";
import { assertValidVariantRegistry, collectVariantDiagnostics } from "./runtime/utils/diagnostics";
import { createVariantGraph } from "./runtime/utils/graph";
import { serializeConfigShape } from "./utils/type-serialization";
import {
  listVariantEntries,
  resolveVariantConfig,
  resolveVariantFeatures,
  type VariantRegistry,
} from "./runtime/utils/variants";
import {
  defineVariantRegistry,
  normalizeVariantRegistry,
  type VariantRegistryInput,
} from "./runtime/utils/registry";

export { VariantRegistryError } from "./runtime/utils/diagnostics";
export type { VariantDiagnostic, VariantDiagnosticCode } from "./runtime/utils/diagnostics";
export type {
  VariantListEntry,
  VariantOverrideRegistry,
  VariantRegistry,
  VariantRegistryEntry,
  VariantRuntimeOverride,
} from "./runtime/utils/variants";

export { defineVariantRegistry };
export type {
  VariantRegistryEntryInput,
  VariantRegistryEntryShorthand,
  VariantRegistryInput,
} from "./runtime/utils/registry";

/** A single variant entry as it appears in either the base registry or appConfig overrides. */
interface VariantEntry {
  extends?: string | string[];
  active?: boolean;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * A registry entry. Can be:
 * - A full entry object: `{ extends?: string | string[]; active?: boolean; config?: {...} }`
 * - An array of strings — shorthand for `{ extends: [...] }` with no config
 * - An empty object `{}` — feature with no config and no extends
 */
export interface ModuleOptions {
  registry: VariantRegistryInput;
  configKey: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-variants",
    configKey: "variants",
    compatibility: {
      nuxt: ">=4.5.0",
    },
  },
  defaults: {
    registry: {},
    configKey: "variants",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Build variant graph up-front so the type template can use it.
    // Normalise shorthand entries (arrays, missing config) into full VariantEntry objects.
    const baseRegistry = normalizeVariantRegistry(options.registry ?? {}) as Record<
      string,
      VariantEntry
    >;

    const appRegistry = (nuxt.options.appConfig[options.configKey] ?? {}) as Record<
      string,
      VariantEntry
    >;

    assertValidVariantRegistry(baseRegistry as VariantRegistry, appRegistry);

    const allRegistryKeys = new Set(Object.keys(baseRegistry));
    const variantGraph = createVariantGraph(baseRegistry);

    const diagnostics = collectVariantDiagnostics(
      baseRegistry as VariantRegistry,
      appRegistry as VariantRegistry,
    );

    const runtimeMjsPath = join(nuxt.options.buildDir, "variants-runtime.mjs");
    const runtimeDmtsPath = join(nuxt.options.buildDir, "variants-runtime.d.mts");
    const runtimeContent = [
      `export const variantRegistry = ${JSON.stringify(baseRegistry, null, 2)};`,
      `export const variantsConfigKey = ${JSON.stringify(options.configKey)};`,
      "",
    ].join("\n");
    const runtimeDtsContent = [
      `import type { VariantRegistry } from "@happydesigns/nuxt-variants";`,
      `export declare const variantRegistry: VariantRegistry;`,
      `export declare const variantsConfigKey: string;`,
      "",
    ].join("\n");
    const devtoolsEnabled = nuxt.options.dev || process.env.NODE_ENV === "test";
    const sourceClientPath = resolver.resolve("../client/.output/public");
    const builtClientPath = resolver.resolve("./client");
    const devtoolsClientPath = existsSync(join(sourceClientPath, "index.html"))
      ? sourceClientPath
      : builtClientPath;

    if (devtoolsEnabled) {
      const variantEntries = listVariantEntries(
        baseRegistry as VariantRegistry,
        appRegistry as VariantRegistry,
      );
      const devtoolsData = {
        configKey: options.configKey,
        variants: variantEntries.map((entry) => ({
          ...entry,
          base: baseRegistry[entry.name] ?? null,
          app: appRegistry[entry.name] ?? null,
          resolvedConfig: resolveVariantConfig(
            entry.name,
            baseRegistry as VariantRegistry,
            appRegistry as VariantRegistry,
          ),
          activeFeatures: [
            ...resolveVariantFeatures(
              entry.name,
              baseRegistry as VariantRegistry,
              appRegistry as VariantRegistry,
            ),
          ],
        })),
        graph: variantGraph,
        diagnostics,
      };
      Object.assign(nuxt.options.runtimeConfig, {
        variantDevtoolsData: devtoolsData,
        variantDevtoolsClientPath: devtoolsClientPath,
      });
    }

    /** Returns the key itself plus all transitive ancestors, deduped, in resolution order. */
    function getAncestors(key: string, visited = new Set<string>()): string[] {
      if (visited.has(key)) return [];
      visited.add(key);
      const parents = variantGraph[key] ?? [];
      return [key, ...parents.flatMap((p) => getAncestors(p, new Set(visited)))];
    }

    addTypeTemplate({
      filename: "types/nuxt-variants.d.ts",
      getContents: () => {
        // Mirror Nuxt's own app.config.d.ts approach: import each layer's app.config.ts
        // directly and include `declare global { const defineAppConfig }` in the same file.
        // This ensures VS Code's language server has `defineAppConfig` in scope when it
        // lazily processes app.config.ts, so `typeof cfg0` resolves to the specific literal
        // type rather than `any`.
        const typesDir = join(nuxt.options.buildDir, "types");

        // Collect app.config file paths from all layers (project root first, then layers).
        const configPaths: string[] = [];
        for (const layer of nuxt.options._layers) {
          const srcDir = (layer.config as { srcDir?: string }).srcDir ?? layer.cwd;
          const candidates = [
            join(srcDir, "app.config.ts"),
            join(srcDir, "app.config.js"),
            join(srcDir, "app.config.mts"),
          ];
          for (const candidate of candidates) {
            if (existsSync(candidate)) {
              configPaths.push(
                relative(typesDir, candidate)
                  .replace(/\.[mc]?[tj]sx?$/, "")
                  .replace(/\\/g, "/"),
              );
              break;
            }
          }
        }

        const imports = configPaths
          .map((p, i) => `import cfg${i} from ${JSON.stringify(p)}`)
          .join("\n");

        // _AppVariants: typed from the imported app.config files.
        const cfgRefs = configPaths.map((_, i) => `typeof cfg${i}`).join(", ");
        const appVariantsType =
          configPaths.length === 0
            ? `Record<never, never>`
            : configPaths.length === 1
              ? `typeof cfg0 extends { ${JSON.stringify(options.configKey)}: infer V } ? V : Record<never, never>`
              : `import('defu').Defu<${cfgRefs.split(", ")[0]}, [${cfgRefs.split(", ").slice(1).join(", ")}]> extends { ${JSON.stringify(options.configKey)}: infer V } ? V : Record<never, never>`;

        // _RegistryVariants: typed from the module registry (nuxt.config.ts options).
        // These are serialized from JS values since nuxt.config.ts is not imported.
        const registryVariantsEntries = Object.entries(baseRegistry)
          .map(([key, entry]) => {
            const configShape = serializeConfigShape(
              ((entry as VariantEntry).config as Record<string, unknown>) ?? {},
            );
            return `  ${JSON.stringify(key)}: { config: ${configShape} }`;
          })
          .join("\n");

        const registryKeys = [...allRegistryKeys];
        const entries = registryKeys
          .map((key) => {
            // Include configs from self + all transitive ancestors so that
            // useVariant('article') returns a type that includes inherited properties.
            const chain = getAncestors(key);
            const configType = chain
              .map((k, index) => {
                // Use `infer` pattern rather than `extends keyof` — TypeScript reliably
                // evaluates infer-based conditionals even when the base type is itself
                // a conditional type, whereas `K extends keyof ConditionalType` can
                // fail to resolve and fall to the else branch (producing never).
                const prop = JSON.stringify(k);
                return `_VariantConfigWithOverride<${prop},
      _VariantConfig<_RegistryVariants extends Record<${prop}, infer _R${index}> ? _R${index} : never>
      & _VariantConfig<_AppVariants extends Record<${prop}, infer _A${index}> ? _A${index} : never>
    >`;
              })
              .join("\n    & ");
            return `  ${JSON.stringify(key)}: ${configType}`;
          })
          .join("\n");

        return `// Generated by nuxt-variants — do not edit.
import type { AppConfigInput } from 'nuxt/schema'
${imports}

declare global {
  const defineAppConfig: <C extends AppConfigInput>(config: C) => C
}

type _AppVariants = ${appVariantsType}
type _RegistryVariants = {
${registryVariantsEntries}
}

type _VariantConfig<T> = [T] extends [never] ? {} : T extends { config?: infer C } ? NonNullable<C> : {}
type _AppVariantConfig<K extends keyof _AppVariants> = _VariantConfig<
  _AppVariants extends Record<K, infer _A> ? _A : never
>

/** Optional consumer-defined refinements for inferred variant config types. */
export interface CustomVariantOverrides {}
type _VariantConfigWithOverride<K extends PropertyKey, T> =
  K extends keyof CustomVariantOverrides ? CustomVariantOverrides[K] : T

type _GeneratedVariantRegistry = {
${entries}
}

export type CustomVariantRegistry = _GeneratedVariantRegistry
export type VariantName = keyof CustomVariantRegistry & string

type _KeysOfUnion<U> = U extends unknown ? keyof U : never
type _ValueForKey<U, K extends PropertyKey> = U extends unknown
  ? K extends keyof U ? U[K] : never
  : never
type _MergeVariantConfigUnion<U> = {
  [K in _KeysOfUnion<U>]?: _ValueForKey<U, K>
}

/** The resolved (merged) config type for a variant key. */
export type VariantConfigOf<K extends keyof CustomVariantRegistry> = _MergeVariantConfigUnion<
  CustomVariantRegistry[K]
>

declare module 'vue-router' {
  interface RouteMeta {
    variant?: VariantName;
  }
}
`;
      },
    });

    nuxt.options.alias["#nuxt-variants"] = `${nuxt.options.buildDir}/types/nuxt-variants`;

    const graphMjsPath = join(nuxt.options.buildDir, "variants-graph.mjs");
    const graphDmtsPath = join(nuxt.options.buildDir, "variants-graph.d.mts");
    const graphContent = [
      `export const variantGraph = ${JSON.stringify(variantGraph, null, 2)};`,
      `export const variantDiagnostics = ${JSON.stringify(diagnostics, null, 2)};`,
      "",
    ].join("\n");
    const graphDtsContent = [
      `export interface VariantDiagnostic { code: "unknown-parent" | "circular-extends" | "runtime-extends" | "unknown-runtime-override"; severity: "error"; variant: string; parent?: string; path?: string[]; message: string }`,
      `export declare const variantGraph: Record<string, string[]>;`,
      `export declare const variantDiagnostics: VariantDiagnostic[];`,
      "",
    ].join("\n");

    const schemasMjsPath = join(nuxt.options.buildDir, "variants-schemas.mjs");
    const schemasDmtsPath = join(nuxt.options.buildDir, "variants-schemas.d.mts");
    const schemasContent =
      [
        `import { mergeVariantSchemas as _merge } from "@happydesigns/nuxt-variants/schemas";`,
        `const _graph = ${JSON.stringify(variantGraph, null, 2)};`,
        `export function mergeVariantSchemas(activeVariants, registry, options) {`,
        `  return _merge(activeVariants, registry, _graph, options);`,
        `}`,
        `export { zodAdapter, valibotAdapter, detectAdapter } from "@happydesigns/nuxt-variants/schemas";`,
      ].join("\n") + "\n";
    const schemasDtsContent =
      [
        `import type { SchemaRegistry, SchemaAdapter, MergeVariantSchemasOptions, AnyObjectSchema, ZodObjectSchema, ValibotObjectSchema } from "@happydesigns/nuxt-variants/schemas";`,
        `export declare function mergeVariantSchemas(activeVariants: string[], registry: Record<string, ZodObjectSchema | undefined>, options?: MergeVariantSchemasOptions): ZodObjectSchema;\nexport declare function mergeVariantSchemas(activeVariants: string[], registry: Record<string, ValibotObjectSchema | undefined>, options?: MergeVariantSchemasOptions): ValibotObjectSchema;\nexport declare function mergeVariantSchemas(activeVariants: string[], registry: Record<string, AnyObjectSchema | undefined>, options?: MergeVariantSchemasOptions): AnyObjectSchema;`,
        `export { zodAdapter, valibotAdapter, detectAdapter } from "@happydesigns/nuxt-variants/schemas";`,
        `export type { SchemaRegistry, SchemaAdapter, MergeVariantSchemasOptions, AnyObjectSchema, ZodObjectSchema, ValibotObjectSchema } from "@happydesigns/nuxt-variants/schemas";`,
      ].join("\n") + "\n";

    // Write eagerly so content.config.ts can import the file at Nuxt init time,
    // before any hooks fire. addTemplate keeps them in sync during build.
    mkdirSync(nuxt.options.buildDir, { recursive: true });
    writeFileSync(runtimeMjsPath, runtimeContent, "utf-8");
    writeFileSync(runtimeDmtsPath, runtimeDtsContent, "utf-8");
    writeFileSync(graphMjsPath, graphContent, "utf-8");
    writeFileSync(graphDmtsPath, graphDtsContent, "utf-8");
    writeFileSync(schemasMjsPath, schemasContent, "utf-8");
    writeFileSync(schemasDmtsPath, schemasDtsContent, "utf-8");

    addTemplate({ filename: "variants-runtime.mjs", getContents: () => runtimeContent });
    addTemplate({ filename: "variants-runtime.d.mts", getContents: () => runtimeDtsContent });
    addTemplate({ filename: "variants-graph.mjs", getContents: () => graphContent });
    addTemplate({ filename: "variants-graph.d.mts", getContents: () => graphDtsContent });
    addTemplate({ filename: "variants-schemas.mjs", getContents: () => schemasContent });
    addTemplate({ filename: "variants-schemas.d.mts", getContents: () => schemasDtsContent });

    nuxt.options.alias["#variants-runtime"] = runtimeMjsPath;
    nuxt.options.alias["#variants-graph"] = graphMjsPath;
    nuxt.options.alias["#variants-schemas"] = schemasMjsPath;

    nuxt.hook("prepare:types", ({ references }) => {
      // Re-write in case Nuxt cleaned buildDir after setup() ran.
      writeFileSync(runtimeMjsPath, runtimeContent, "utf-8");
      writeFileSync(runtimeDmtsPath, runtimeDtsContent, "utf-8");
      writeFileSync(graphMjsPath, graphContent, "utf-8");
      writeFileSync(graphDmtsPath, graphDtsContent, "utf-8");
      writeFileSync(schemasMjsPath, schemasContent, "utf-8");
      writeFileSync(schemasDmtsPath, schemasDtsContent, "utf-8");
      references.push({ path: runtimeDmtsPath });
      references.push({ path: graphDmtsPath });
      references.push({ path: schemasDmtsPath });
    });

    if (devtoolsEnabled) {
      addServerHandler({
        route: "/__nuxt-variants/devtools",
        handler: resolver.resolve("./runtime/server/devtools.get"),
      });
      addServerHandler({
        route: "/__nuxt-variants/devtools/data.json",
        handler: resolver.resolve("./runtime/server/devtools-data.get"),
      });
      addServerHandler({
        route: "/__nuxt-variants/devtools/**",
        handler: resolver.resolve("./runtime/server/devtools.get"),
      });

      addCustomTab(
        {
          name: "nuxt-variants",
          title: "Nuxt Variants",
          icon: "i-lucide-git-branch",
          category: "app",
          view: {
            type: "iframe",
            src: "/__nuxt-variants/devtools",
          },
        },
        nuxt,
      );
    }

    addImportsDir(resolver.resolve("./runtime/composables"));
  },
});
