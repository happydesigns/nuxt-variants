import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  defineNuxtModule,
  addImportsDir,
  addTypeTemplate,
  addTemplate,
  createResolver,
} from "@nuxt/kit";

/** A single variant entry as it appears in either the base registry or appConfig overrides. */
interface VariantEntry {
  extends?: string | string[];
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * A registry entry. Can be:
 * - A full entry object: `{ extends?: string | string[]; config?: {...} }`
 * - An array of strings — shorthand for `{ extends: [...] }` with no config
 * - An empty object `{}` — feature with no config and no extends
 */
type RegistryEntryInput =
  | string[]
  | { extends?: string | string[]; config?: Record<string, unknown> };

export interface ModuleOptions {
  registry: Record<string, RegistryEntryInput>;
  configKey: string;
}

/** Normalise any shorthand registry entry into a full VariantEntry. */
function normalizeEntry(raw: RegistryEntryInput): VariantEntry {
  if (Array.isArray(raw)) return { extends: raw, config: {} };
  return { ...raw, config: raw.config ?? {} };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-variants",
    configKey: "variants",
  },
  defaults: {
    registry: {},
    configKey: "variants",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Build variant graph up-front so the type template can use it.
    // Normalise shorthand entries (arrays, missing config) into full VariantEntry objects.
    const baseRegistry = Object.fromEntries(
      Object.entries(options.registry ?? {}).map(([k, v]) => [k, normalizeEntry(v)]),
    ) as Record<string, VariantEntry>;

    Object.assign(nuxt.options.runtimeConfig.public, {
      variantRegistry: baseRegistry,
      variantsConfigKey: options.configKey,
    });
    const appRegistry = (nuxt.options.appConfig[options.configKey] ?? {}) as Record<
      string,
      VariantEntry
    >;

    const allRegistryKeys = new Set([...Object.keys(baseRegistry), ...Object.keys(appRegistry)]);
    const variantGraph: Record<string, string[]> = {};

    for (const key of allRegistryKeys) {
      const extendsValue = appRegistry[key]?.extends ?? baseRegistry[key]?.extends;
      variantGraph[key] =
        extendsValue === undefined
          ? []
          : Array.isArray(extendsValue)
            ? extendsValue
            : [extendsValue];
    }

    /** Converts a JS config object into a TypeScript type literal string (widened to primitives). */
    function serializeConfigShape(config: Record<string, unknown>): string {
      const entries = Object.entries(config).map(([k, v]) => {
        let t: string;
        if (v === null) t = "null";
        else if (Array.isArray(v)) t = "unknown[]";
        else
          switch (typeof v) {
            case "string":
              t = "string";
              break;
            case "number":
              t = "number";
              break;
            case "boolean":
              t = "boolean";
              break;
            case "object":
              t = serializeConfigShape(v as Record<string, unknown>);
              break;
            default:
              t = "unknown";
          }
        return `${k}: ${t}`;
      });
      return entries.length ? `{ ${entries.join("; ")} }` : "{}";
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
              ? `typeof cfg0 extends { ${options.configKey}: infer V } ? V : Record<never, never>`
              : `import('defu').Defu<${cfgRefs.split(", ")[0]}, [${cfgRefs.split(", ").slice(1).join(", ")}]> extends { ${options.configKey}: infer V } ? V : Record<never, never>`;

        // _RegistryVariants: typed from the module registry (nuxt.config.ts options).
        // These are serialized from JS values since nuxt.config.ts is not imported.
        const registryVariantsEntries = Object.entries(baseRegistry)
          .map(([key, entry]) => {
            const configShape = serializeConfigShape(
              ((entry as VariantEntry).config as Record<string, unknown>) ?? {},
            );
            return `  ${key}: { config: ${configShape} }`;
          })
          .join("\n");

        const registryKeys = Object.keys(baseRegistry);
        const entries = registryKeys
          .map((key) => {
            // Include configs from self + all transitive ancestors so that
            // useVariant('article') returns a type that includes inherited properties.
            const chain = getAncestors(key);
            const configType = chain
              .map((k) => {
                // Use `infer` pattern rather than `extends keyof` — TypeScript reliably
                // evaluates infer-based conditionals even when the base type is itself
                // a conditional type, whereas `K extends keyof ConditionalType` can
                // fail to resolve and fall to the else branch (producing never).
                return `_VariantConfig<_AppVariants extends { ${k}: infer _E${k} } ? _E${k} : _RegistryVariants extends { ${k}: infer _E${k} } ? _E${k} : never>`;
              })
              .join("\n    & ");
            return `  ${key}: ${configType}`;
          })
          .join("\n");

        return `// Generated by nuxt-variants — do not edit.
import type { AppConfigInput } from 'nuxt/schema'
${imports}

declare global {
  const defineAppConfig: <C extends AppConfigInput>(config: C) => C
}

type _VariantConfig<T> = T extends { config?: infer C } ? NonNullable<C> : {}
type _AppVariants = ${appVariantsType}
type _RegistryVariants = {
${registryVariantsEntries}
}

export interface CustomVariantRegistry {
${entries}
}

/** The resolved (merged) config type for a variant key. */
export type VariantConfigOf<K extends keyof CustomVariantRegistry> = Partial<CustomVariantRegistry[K]>

declare module 'vue-router' {
  interface RouteMeta {
    variant?: string;
  }
}
`;
      },
    });

    nuxt.options.alias["#nuxt-variants"] = `${nuxt.options.buildDir}/types/nuxt-variants`;

    // Inject graph into globalThis so utilities like mergeVariantSchemas
    // can find it automatically even when called in content.config.ts
    (globalThis as any).__NUXT_VARIANTS_GRAPH__ = variantGraph;

    const graphMjsPath = join(nuxt.options.buildDir, "variants-graph.mjs");
    const graphDmtsPath = join(nuxt.options.buildDir, "variants-graph.d.mts");
    const graphContent = `export const variantGraph = ${JSON.stringify(variantGraph, null, 2)};\n`;
    const graphDtsContent = `export declare const variantGraph: Record<string, string[]>;\n`;

    const schemasMjsPath = join(nuxt.options.buildDir, "variants-schemas.mjs");
    const schemasDmtsPath = join(nuxt.options.buildDir, "variants-schemas.d.mts");
    const schemasContent =
      [
        `import { mergeVariantSchemas as _merge } from "@h4designs/nuxt-variants/schemas";`,
        `const _graph = ${JSON.stringify(variantGraph, null, 2)};`,
        `export function mergeVariantSchemas(activeVariants, registry) {`,
        `  return _merge(activeVariants, registry, _graph);`,
        `}`,
        `export { zodAdapter, valibotAdapter, detectAdapter } from "@h4designs/nuxt-variants/schemas";`,
      ].join("\n") + "\n";
    const schemasDtsContent =
      [
        `import type { SchemaRegistry, SchemaAdapter, AnyObjectSchema, ZodObjectSchema, ValibotObjectSchema } from "@h4designs/nuxt-variants/schemas";`,
        `export declare function mergeVariantSchemas(activeVariants: string[], registry: SchemaRegistry): AnyObjectSchema;`,
        `export { zodAdapter, valibotAdapter, detectAdapter } from "@h4designs/nuxt-variants/schemas";`,
        `export type { SchemaRegistry, SchemaAdapter, AnyObjectSchema, ZodObjectSchema, ValibotObjectSchema } from "@h4designs/nuxt-variants/schemas";`,
      ].join("\n") + "\n";

    // Write eagerly so content.config.ts can import the file at Nuxt init time,
    // before any hooks fire. addTemplate keeps them in sync during build.
    mkdirSync(nuxt.options.buildDir, { recursive: true });
    writeFileSync(graphMjsPath, graphContent, "utf-8");
    writeFileSync(graphDmtsPath, graphDtsContent, "utf-8");
    writeFileSync(schemasMjsPath, schemasContent, "utf-8");
    writeFileSync(schemasDmtsPath, schemasDtsContent, "utf-8");

    addTemplate({ filename: "variants-graph.mjs", getContents: () => graphContent });
    addTemplate({ filename: "variants-graph.d.mts", getContents: () => graphDtsContent });
    addTemplate({ filename: "variants-schemas.mjs", getContents: () => schemasContent });
    addTemplate({ filename: "variants-schemas.d.mts", getContents: () => schemasDtsContent });

    nuxt.options.alias["#variants-graph"] = graphMjsPath;
    nuxt.options.alias["#variants-schemas"] = schemasMjsPath;

    nuxt.hook("prepare:types", ({ references }) => {
      // Re-write in case Nuxt cleaned buildDir after setup() ran.
      writeFileSync(graphMjsPath, graphContent, "utf-8");
      writeFileSync(graphDmtsPath, graphDtsContent, "utf-8");
      writeFileSync(schemasMjsPath, schemasContent, "utf-8");
      writeFileSync(schemasDmtsPath, schemasDtsContent, "utf-8");
      references.push({ path: graphDmtsPath });
      references.push({ path: schemasDmtsPath });
    });

    addImportsDir(resolver.resolve("./runtime/composables"));
    addImportsDir(resolver.resolve("./runtime/utils"));
  },
});
