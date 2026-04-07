import { detectAdapter } from "./adapters/detect";
import type { AnyObjectSchema } from "./adapters/types";

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
 * @param graph - The pre-computed variant inheritance graph. When omitted the
 *   function treats every variant as having no parents (flat resolution).
 * @returns The merged object schema, or an empty object schema when no
 *   registered schema is found for any of the active variants.
 */
export function mergeVariantSchemas(
  activeVariants: string[],
  registry: SchemaRegistry,
  graph: Record<string, string[]> = {},
): AnyObjectSchema {
  const firstSchema = activeVariants
    .flatMap((v) => resolveExtendsGraph([v], graph))
    .map((name) => registry[name])
    .find((s): s is AnyObjectSchema => s !== undefined);

  if (!firstSchema) {
    return {} as AnyObjectSchema;
  }

  const adapter = detectAdapter(firstSchema);
  let base = adapter.emptyObject() as AnyObjectSchema;

  const flattened = resolveExtendsGraph(activeVariants, graph);

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
