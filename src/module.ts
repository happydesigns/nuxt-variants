import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  defineNuxtModule,
  addImportsDir,
  addTypeTemplate,
  addTemplate,
  addServerHandler,
  createResolver,
} from "@nuxt/kit";
import { addCustomTab } from "@nuxt/devtools-kit";
import {
  assertValidVariantInputs,
  assertValidVariantRegistry,
  collectVariantDiagnostics,
} from "./runtime/utils/diagnostics";
import { createVariantGraph } from "./runtime/utils/graph";
import { serializeConfigShape } from "./utils/type-serialization";
import { collectVariantSources } from "./utils/layer-sources";
import { createVariantResolutionPlan, type VariantRegistry } from "./runtime/utils/variants";
import {
  defineVariantRegistry,
  normalizeVariantRegistry,
  type VariantRegistryInput,
} from "./runtime/utils/registry";

export { VariantRegistryError } from "./runtime/utils/diagnostics";
export type { VariantDiagnostic, VariantDiagnosticCode } from "./runtime/utils/diagnostics";
export type { VariantGraph } from "./runtime/utils/graph";
export type {
  VariantListEntry,
  VariantOverrideRegistry,
  VariantRegistry,
  VariantRegistryEntry,
  VariantResolutionPlan,
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
  /** Build-time variant names, inheritance, and default values. */
  registry?: VariantRegistryInput;
  /** App-config key used for runtime value overrides. @default "variants" */
  configKey?: string;
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
    const configKey = options.configKey ?? "variants";
    const registryInput = options.registry ?? {};
    const appRegistry = (nuxt.options.appConfig[configKey] ?? {}) as Record<string, VariantEntry>;

    assertValidVariantInputs(
      registryInput as Record<string, unknown>,
      appRegistry as Record<string, unknown>,
    );

    // Build variant graph up-front so the type template can use it.
    // Normalise shorthand entries (arrays, missing config) into full VariantEntry objects.
    const baseRegistry = normalizeVariantRegistry(registryInput) as Record<string, VariantEntry>;

    assertValidVariantRegistry(baseRegistry as VariantRegistry, appRegistry);

    const allRegistryKeys = new Set(Object.keys(baseRegistry));
    const variantGraph = createVariantGraph(baseRegistry);
    const variantResolutionPlan = createVariantResolutionPlan(baseRegistry as VariantRegistry);

    const diagnostics = collectVariantDiagnostics(
      baseRegistry as VariantRegistry,
      appRegistry as VariantRegistry,
    );

    const runtimeMjsPath = join(nuxt.options.buildDir, "variants-runtime.mjs");
    const runtimeDmtsPath = join(nuxt.options.buildDir, "variants-runtime.d.mts");
    const runtimeContent = [
      `export const variantRegistry = ${JSON.stringify(baseRegistry, null, 2)};`,
      `export const variantResolutionPlan = ${JSON.stringify(variantResolutionPlan, null, 2)};`,
      `export const variantsConfigKey = ${JSON.stringify(configKey)};`,
      "",
    ].join("\n");
    const runtimeDtsContent = [
      `import type { VariantRegistry, VariantResolutionPlan } from "@happydesigns/nuxt-variants";`,
      `export declare const variantRegistry: Readonly<VariantRegistry>;`,
      `export declare const variantResolutionPlan: VariantResolutionPlan;`,
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
      const variantSources = collectVariantSources(nuxt.options._layers, configKey);
      const devtoolsMetadata = {
        configKey,
        registry: baseRegistry,
        sources: variantSources,
      };
      Object.assign(nuxt.options.runtimeConfig, {
        variantDevtoolsMetadata: devtoolsMetadata,
        variantDevtoolsClientPath: devtoolsClientPath,
      });
    }

    addTypeTemplate({
      filename: "types/nuxt-variants.d.ts",
      getContents: () => {
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
        const indexes = new Map(registryKeys.map((key, index) => [key, index]));
        const resolvedTypes = registryKeys
          .map((key, index) => {
            const parents = variantGraph[key] ?? [];
            const inherited =
              parents.map((parent) => `_Sources_${indexes.get(parent)}`).join(" | ") || "never";
            const refinements = [
              ...parents.map((parent) => `_Refinement_${indexes.get(parent)}`),
              `_OwnRefinement<${JSON.stringify(key)}>`,
            ].join(" | ");
            return `type _Sources_${index} = _Entry<${JSON.stringify(key)}> | ${inherited};
type _Refinement_${index} = ${refinements};
type _Resolved_${index} = _RefineConfig<_MergeObject<_JoinObject<${inherited}>, _Entry<${JSON.stringify(key)}>>, _Refinement_${index}>;`;
          })
          .join("\n");
        const entries = registryKeys
          .map((key, index) => `  ${JSON.stringify(key)}: _Resolved_${index}`)
          .join("\n");
        return `// Generated by nuxt-variants — do not edit.
import type { AppConfig } from 'nuxt/schema'

type _AppVariants = AppConfig extends { ${JSON.stringify(configKey)}?: infer V }
  ? NonNullable<V>
  : Record<never, never>
type _RegistryVariants = {
${registryVariantsEntries}
}

type _VariantConfig<T> = [T] extends [never] ? {} : T extends { config?: infer C } ? NonNullable<C> : {}

/** Optional application or layer-defined refinements for registry config types. */
export interface CustomVariantOverrides {}
type _VariantConfigWithOverride<K extends PropertyKey, T> =
  K extends keyof CustomVariantOverrides ? CustomVariantOverrides[K] : T
type _UnionKeys<U> = U extends unknown ? keyof U : never;
type _UnionValue<U, K extends PropertyKey> = U extends unknown ? K extends keyof U ? U[K] : never : never;
type _Objects<U> = U extends readonly unknown[] ? never : U extends object ? U : never;
type _NonObjects<U> = U extends readonly unknown[] ? U : U extends object ? never : U;
type _JoinValue<U> = _NonObjects<U> | ([_Objects<U>] extends [never] ? never : _JoinObject<_Objects<U>>);
/** Inherited entries can disappear independently when their active state changes. */
type _JoinObject<U> = { [K in _UnionKeys<U>]?: _JoinValue<_UnionValue<U, K>> };

type _Field<T, K extends PropertyKey> = K extends keyof T ? T[K] : undefined;
type _GuaranteedKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never :
  [Extract<T[K], null | undefined>] extends [never] ? K : never }[keyof T];
type _MergeValue<L, H> = H extends null | undefined ? L :
  H extends readonly unknown[] ? H : H extends object ?
  [_Objects<L>] extends [never] ? H :
  _MergeObject<[L] extends [_Objects<L>] ? L : _JoinObject<_Objects<L>>, H> : H;
/** Own values win; inherited-only keys retain their optional modifiers. */
type _MergeObject<L, H> = {
  [K in Exclude<keyof L | keyof H, _GuaranteedKeys<L> | _GuaranteedKeys<H>>]?: _MergeValue<_Field<L, K>, _Field<H, K>>
} & {
  [K in _GuaranteedKeys<L> | _GuaranteedKeys<H>]-?: _MergeValue<_Field<L, K>, _Field<H, K>>
};
type _Entry<K extends PropertyKey> = _VariantConfigWithOverride<K, _MergeObject<
  _VariantConfig<_RegistryVariants extends Record<K, infer R> ? R : never>,
  _VariantConfig<_AppVariants extends Record<K, infer A> ? A : never>
>>;
type _OwnRefinement<K extends PropertyKey> = CustomVariantOverrides extends Record<K, infer R> ? R : {};
type _RefineValue<V, R> = V extends undefined ? undefined : V extends readonly unknown[] ? V & R :
  V extends object ? R extends object ? _RefineConfig<V, R> : V & R : V & R;
type _RefinementValue<R, K extends PropertyKey> =
  (R extends unknown ? K extends keyof R ? (value: R[K]) => void : never : never) extends (value: infer V) => void ? V : never;
type _RefineConfig<C, R> = { [K in keyof C]: K extends _UnionKeys<R> ? _RefineValue<C[K], _RefinementValue<R, K>> : C[K] };

${resolvedTypes}

type _GeneratedVariantRegistry = {
${entries}
}

export type CustomVariantRegistry = _GeneratedVariantRegistry
export type VariantName = keyof CustomVariantRegistry & string
export type VariantNameInput = VariantName | (string & Record<never, never>)

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
      `import type { VariantDiagnostic, VariantGraph } from "@happydesigns/nuxt-variants";`,
      `export declare const variantGraph: VariantGraph;`,
      `export declare const variantDiagnostics: readonly VariantDiagnostic[];`,
      "",
    ].join("\n");

    // Write eagerly so runtime and type aliases exist before Nuxt's hooks run.
    // addTemplate keeps them in sync during build.
    mkdirSync(nuxt.options.buildDir, { recursive: true });
    writeFileSync(runtimeMjsPath, runtimeContent, "utf-8");
    writeFileSync(runtimeDmtsPath, runtimeDtsContent, "utf-8");
    writeFileSync(graphMjsPath, graphContent, "utf-8");
    writeFileSync(graphDmtsPath, graphDtsContent, "utf-8");

    addTemplate({ filename: "variants-runtime.mjs", getContents: () => runtimeContent });
    addTemplate({ filename: "variants-runtime.d.mts", getContents: () => runtimeDtsContent });
    addTemplate({ filename: "variants-graph.mjs", getContents: () => graphContent });
    addTemplate({ filename: "variants-graph.d.mts", getContents: () => graphDtsContent });

    nuxt.options.alias["#variants-runtime"] = runtimeMjsPath;
    nuxt.options.alias["#variants-graph"] = graphMjsPath;

    nuxt.hook("prepare:types", ({ references }) => {
      // Re-write in case Nuxt cleaned buildDir after setup() ran.
      writeFileSync(runtimeMjsPath, runtimeContent, "utf-8");
      writeFileSync(runtimeDmtsPath, runtimeDtsContent, "utf-8");
      writeFileSync(graphMjsPath, graphContent, "utf-8");
      writeFileSync(graphDmtsPath, graphDtsContent, "utf-8");
      references.push({ path: runtimeDmtsPath });
      references.push({ path: graphDmtsPath });
    });

    if (devtoolsEnabled) {
      const appBaseURL = nuxt.options.app.baseURL.replace(/\/+$/, "");
      const devtoolsRoute = `${appBaseURL}/__nuxt-variants/devtools`;

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
            src: devtoolsRoute,
          },
        },
        nuxt,
      );
    }

    addImportsDir(resolver.resolve("./runtime/composables"));
  },
});
