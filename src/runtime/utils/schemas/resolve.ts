import { detectAdapter } from "./adapters/detect";
import type { AnyObjectSchema, ZodObjectSchema, ValibotObjectSchema } from "./adapters/types";

/**
 * A registry mapping variant names to their object schemas.
 * Entries may be `undefined` for variants that have no schema of their own.
 */
export interface SchemaRegistry {
  [variantName: string]: AnyObjectSchema | undefined;
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
 * @param graph - The pre-computed variant inheritance graph. When omitted, it
 *   tries to use the global graph injected by the Nuxt module.
 * @returns The merged object schema, or an empty object schema when no
 *   registered schema is found for any of the active variants.
 */
export function mergeVariantSchemas(activeVariants: string[], registry: Record<string, ZodObjectSchema | undefined>, graph?: Record<string, string[]>): ZodObjectSchema;
export function mergeVariantSchemas(activeVariants: string[], registry: Record<string, ValibotObjectSchema | undefined>, graph?: Record<string, string[]>): ValibotObjectSchema;
export function mergeVariantSchemas(activeVariants: string[], registry: Record<string, AnyObjectSchema | undefined>, graph?: Record<string, string[]>): AnyObjectSchema;
export function mergeVariantSchemas(
  activeVariants: string[],
  registry: Record<string, AnyObjectSchema | undefined>,
  graph?: Record<string, string[]>,
): AnyObjectSchema {
  if (graph === undefined) {
    const injected = (globalThis as any).__NUXT_VARIANTS_GRAPH__;
    if (injected === undefined) {
      throw new Error(
        "[nuxt-variants] mergeVariantSchemas: no variant graph available. " +
          "Either pass the graph explicitly as the third argument, or ensure the nuxt-variants " +
          "module is listed before @nuxt/content in your modules array so the graph is " +
          "injected into globalThis before content.config.ts is evaluated.",
      );
    }
    graph = injected as Record<string, string[]>;
  }
  const resolvedGraph = graph as Record<string, string[]>;
  const firstSchema = activeVariants
    .flatMap((v) => resolveExtendsGraph([v], resolvedGraph))
    .map((name) => registry[name])
    .find((s): s is AnyObjectSchema => s !== undefined);

  if (!firstSchema) {
    return {} as AnyObjectSchema;
  }

  const adapter = detectAdapter(firstSchema);
  let base = adapter.emptyObject() as AnyObjectSchema;

  const flattened = resolveExtendsGraph(activeVariants, resolvedGraph);

  for (const name of flattened) {
    const extra = registry[name];
    if (extra === undefined) continue;

    const extraAdapter = detectAdapter(extra);
    if (extraAdapter !== adapter) {
      throw new Error(
        `[nuxt-variants] Schema adapter mismatch for variant "${name}". ` +
          "All schemas in a registry must use the same validator library.",
      );
    }

    base = adapter.merge(base, extra) as AnyObjectSchema;
  }

  return base;
}
