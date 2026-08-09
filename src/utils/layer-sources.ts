import { basename } from "node:path";
import {
  normalizeVariantRegistry,
  type NormalizedVariantRegistryEntry,
  type VariantRegistryInput,
} from "../runtime/utils/registry";

export interface VariantSource {
  /** Stable, human-readable Nuxt layer name. */
  name: string;
  /** Whether this contribution comes from the consuming application or an extended layer. */
  kind: "application" | "layer";
  /** The entry declared by this source before Nuxt merges layer configuration. */
  entry: NormalizedVariantRegistryEntry;
}

interface NuxtLayerLike {
  cwd?: string;
  config: object;
}

function sourceName(layer: NuxtLayerLike, index: number): string {
  if (index === 0) return "Application";

  const explicitName = (
    layer.config as {
      $meta?: { name?: string };
    }
  ).$meta?.name?.trim();
  if (explicitName) return explicitName;

  return layer.cwd ? basename(layer.cwd) : `Layer ${index}`;
}

/**
 * Collects variant declarations from every Nuxt layer without exposing local paths.
 * Nuxt stores the consuming application first, so the result keeps precedence order.
 */
export function collectVariantSources(
  layers: readonly NuxtLayerLike[],
  configKey: string,
): Record<string, VariantSource[]> {
  const sources: Record<string, VariantSource[]> = {};

  layers.forEach((layer, index) => {
    const options = (layer.config as Record<string, unknown>)[configKey] as
      | { registry?: VariantRegistryInput }
      | undefined;
    const registry = normalizeVariantRegistry(options?.registry ?? {});

    for (const [variant, entry] of Object.entries(registry)) {
      (sources[variant] ??= []).push({
        name: sourceName(layer, index),
        kind: index === 0 ? "application" : "layer",
        entry,
      });
    }
  });

  return sources;
}
