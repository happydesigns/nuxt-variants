import { collectVariantDiagnostics } from "./diagnostics";
import type { VariantSource } from "../../utils/layer-sources";
import { createVariantGraph, type VariantGraph } from "./graph";
import {
  listVariantEntries,
  resolveVariantConfig,
  resolveVariantFeatures,
  type VariantOverrideRegistry,
  type VariantRegistry,
} from "./variants";

export type VariantSourceEntry = VariantSource;

export type VariantSources = Readonly<Record<string, readonly VariantSourceEntry[]>>;

export interface VariantDevtoolsMetadata {
  configKey: string;
  registry: VariantRegistry;
  sources: VariantSources;
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
}

/** Creates an inspector snapshot from the immutable registry and current app-config overrides. */
export function createVariantDevtoolsData(
  metadata: VariantDevtoolsMetadata,
  appRegistry: VariantOverrideRegistry,
): VariantDevtoolsData {
  const { configKey, registry, sources } = metadata;

  return {
    configKey,
    variants: listVariantEntries(registry, appRegistry).map((entry) => {
      const activeFeatures = [...resolveVariantFeatures(entry.name, registry, appRegistry)];

      return {
        ...entry,
        base: registry[entry.name] ?? null,
        app: appRegistry[entry.name] ?? {},
        resolvedConfig: resolveVariantConfig(entry.name, registry, appRegistry),
        activeFeatures,
        active: activeFeatures.includes(entry.name),
        sources: sources[entry.name] ?? [],
      };
    }),
    graph: createVariantGraph(registry),
    diagnostics: collectVariantDiagnostics(registry, appRegistry),
  };
}
