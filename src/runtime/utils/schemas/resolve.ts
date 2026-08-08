import { detectAdapter } from "./adapters/detect";
import type {
  AnyObjectSchema,
  SchemaAdapter,
  ZodObjectSchema,
  ValibotObjectSchema,
} from "./adapters/types";

/**
 * A registry mapping variant names to their object schemas.
 * Entries may be `undefined` for variants that have no schema of their own.
 */
export interface SchemaRegistry {
  [variantName: string]: AnyObjectSchema | undefined;
}

export interface MergeVariantSchemasOptions {
  /**
   * Adapter used to create a valid empty object schema when the registry does
   * not contain any schemas from which the validator can be inferred.
   */
  adapter?: SchemaAdapter;
}

function resolveExtendsGraph(variants: string[], graph: Record<string, string[]>): string[] {
  const result: string[] = [];
  const visited = new Set<string>();

  function walk(name: string): void {
    if (visited.has(name)) return;
    visited.add(name);

    for (const parent of graph[name] ?? []) {
      walk(parent);
    }

    result.push(name);
  }

  for (const variant of variants) {
    walk(variant);
  }

  return result;
}

/**
 * Merges all schemas reachable from `activeVariants` (including their full
 * `extends` ancestry) into a single unified object schema.
 *
 * Resolution order is bottom-up: ancestors are merged before descendants so
 * that child schemas correctly override parent fields.
 *
 * @param activeVariants - The variant names that are currently active.
 * @param registry - A map of variant names to their object schemas.
 * @param graph - The pre-computed variant inheritance graph.
 * @param options - Optional validator adapter for an entirely empty registry.
 * @returns The merged object schema, or a valid empty object schema when no
 *   registered schema is reachable from the active variants.
 */
export function mergeVariantSchemas(
  activeVariants: string[],
  registry: Record<string, ZodObjectSchema | undefined>,
  graph: Record<string, string[]>,
  options?: MergeVariantSchemasOptions,
): ZodObjectSchema;
export function mergeVariantSchemas(
  activeVariants: string[],
  registry: Record<string, ValibotObjectSchema | undefined>,
  graph: Record<string, string[]>,
  options?: MergeVariantSchemasOptions,
): ValibotObjectSchema;
export function mergeVariantSchemas(
  activeVariants: string[],
  registry: Record<string, AnyObjectSchema | undefined>,
  graph: Record<string, string[]>,
  options?: MergeVariantSchemasOptions,
): AnyObjectSchema;
export function mergeVariantSchemas(
  activeVariants: string[],
  registry: Record<string, AnyObjectSchema | undefined>,
  graph: Record<string, string[]>,
  options: MergeVariantSchemasOptions = {},
): AnyObjectSchema {
  for (const variant of activeVariants) {
    if (!(variant in graph)) {
      throw new Error(
        `[nuxt-variants] mergeVariantSchemas: unknown active variant "${variant}". ` +
          "Register the variant before using it in a collection schema.",
      );
    }
  }

  for (const name of Object.keys(registry)) {
    if (!(name in graph)) {
      throw new Error(
        `[nuxt-variants] mergeVariantSchemas: schema registered for unknown variant "${name}". ` +
          "Schema registry keys must match registered variants.",
      );
    }
  }

  const flattened = resolveExtendsGraph(activeVariants, graph);
  const firstSchema = flattened
    .map((name) => registry[name])
    .find((schema): schema is AnyObjectSchema => schema !== undefined);
  const fallbackSchema = Object.values(registry).find(
    (schema): schema is AnyObjectSchema => schema !== undefined,
  );
  const adapter = firstSchema
    ? detectAdapter(firstSchema)
    : fallbackSchema
      ? detectAdapter(fallbackSchema)
      : options.adapter;

  if (!adapter) {
    throw new Error(
      "[nuxt-variants] mergeVariantSchemas: cannot create an empty object schema because " +
        "the schema registry is empty. Pass a validator adapter in the fourth argument.",
    );
  }

  for (const [name, schema] of Object.entries(registry)) {
    if (schema !== undefined && detectAdapter(schema) !== adapter) {
      throw new Error(
        `[nuxt-variants] Schema adapter mismatch for variant "${name}". ` +
          "All schemas in a registry must use the same validator library.",
      );
    }
  }

  let base = adapter.emptyObject() as AnyObjectSchema;

  for (const name of flattened) {
    const extra = registry[name];
    if (extra === undefined) continue;

    base = adapter.merge(base, extra) as AnyObjectSchema;
  }

  return base;
}
