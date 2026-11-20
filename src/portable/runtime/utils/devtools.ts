import { collectVariantDiagnostics } from "./diagnostics";
import { createVariantGraph, type VariantGraph } from "./graph";
import type { NormalizedVariantRegistryEntry } from "./registry";
import type { VariantGroups } from "../../core";
import {
  listVariantEntries,
  resolveVariantConfigFromLineage,
  resolveVariantFeatures,
  type VariantOverrideRegistry,
  type VariantRegistry,
} from "./variants";

export interface VariantSourceEntry {
  /** Stable, human-readable layer name. */
  name: string;
  /** Whether this contribution comes from the application or an extended layer. */
  kind: "application" | "layer";
  /** The entry declared by this source before merging layers. */
  entry: NormalizedVariantRegistryEntry;
}

export type VariantSources = Readonly<Record<string, readonly VariantSourceEntry[]>>;

export interface VariantDevtoolsMetadata {
  configKey: string;
  registry: VariantRegistry;
  sources: VariantSources;
  groups?: VariantGroups;
}

export interface VariantDevtoolsEntry {
  name: string;
  extends: string[];
  configKeys: string[];
  base: VariantRegistry[string] | null;
  app: VariantOverrideRegistry[string];
  resolvedConfig: Record<string, unknown>;
  activeFeatures: string[];
  active: boolean;
  sources: readonly VariantSourceEntry[];
}

export interface VariantDevtoolsData {
  configKey: string;
  variants: VariantDevtoolsEntry[];
  graph: VariantGraph;
  diagnostics: ReturnType<typeof collectVariantDiagnostics>;
  groups?: VariantGroups;
}

/** Creates an inspector snapshot from the immutable registry and current app-config overrides. */
export function createVariantDevtoolsData(
  metadata: VariantDevtoolsMetadata,
  appRegistry: VariantOverrideRegistry,
): VariantDevtoolsData {
  const { configKey, registry, sources, groups } = metadata;

  return {
    configKey,
    ...(groups && { groups }),
    variants: listVariantEntries(registry, appRegistry).map((entry) => {
      const activeFeatures = [...resolveVariantFeatures(entry.name, registry, appRegistry)];

      return {
        ...entry,
        base: registry[entry.name] ?? null,
        app: appRegistry[entry.name] ?? {},
        resolvedConfig: resolveVariantConfigFromLineage(activeFeatures, registry, appRegistry),
        activeFeatures,
        active: activeFeatures.includes(entry.name),
        sources: sources[entry.name] ?? [],
      };
    }),
    graph: createVariantGraph(registry),
    diagnostics: collectVariantDiagnostics(registry, appRegistry),
  };
}
