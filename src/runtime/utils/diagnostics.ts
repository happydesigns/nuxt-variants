import { getVariantExtends, type VariantRegistry } from "./variants";

export type VariantDiagnosticCode =
  | "unknown-parent"
  | "circular-extends"
  | "runtime-extends"
  | "unknown-runtime-override";

export interface VariantDiagnostic {
  code: VariantDiagnosticCode;
  severity: "error";
  variant: string;
  parent?: string;
  path?: string[];
  message: string;
}

export class VariantRegistryError extends Error {
  readonly code = "NUXT_VARIANTS_INVALID_REGISTRY";

  constructor(readonly diagnostics: VariantDiagnostic[]) {
    super(
      [
        `[nuxt-variants] Invalid variant registry (${diagnostics.length} ${diagnostics.length === 1 ? "error" : "errors"}).`,
        ...diagnostics.map((diagnostic) => `- [${diagnostic.code}] ${diagnostic.message}`),
      ].join("\n"),
    );
    this.name = "VariantRegistryError";
  }
}

export function collectVariantDiagnostics(
  baseRegistry: VariantRegistry,
  overrideRegistry: Record<string, unknown>,
): VariantDiagnostic[] {
  const diagnostics: VariantDiagnostic[] = [];
  const keys = new Set(Object.keys(baseRegistry));
  const graph = Object.fromEntries(
    [...keys].map((key) => [key, getVariantExtends(key, baseRegistry)]),
  );

  for (const [variant, parents] of Object.entries(graph)) {
    for (const parent of parents) {
      if (!keys.has(parent)) {
        diagnostics.push({
          code: "unknown-parent",
          severity: "error",
          variant,
          parent,
          message: `Variant "${variant}" extends unknown variant "${parent}".`,
        });
      }
    }
  }

  const emittedCycles = new Set<string>();

  function cycleKey(cycle: string[]): string {
    const nodes = cycle.slice(0, -1);
    if (nodes.length === 0) return "";
    const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)]);
    return rotations.map((rotation) => rotation.join(" -> ")).sort()[0]!;
  }

  function visit(variant: string, path: string[]): void {
    const existingIndex = path.indexOf(variant);
    if (existingIndex !== -1) {
      const cycle = [...path.slice(existingIndex), variant];
      const key = cycleKey(cycle);
      if (!emittedCycles.has(key)) {
        emittedCycles.add(key);
        diagnostics.push({
          code: "circular-extends",
          severity: "error",
          variant,
          path: cycle,
          message: `Variant inheritance cycle detected: ${cycle.join(" -> ")}.`,
        });
      }
      return;
    }

    for (const parent of graph[variant] ?? []) {
      if (keys.has(parent)) visit(parent, [...path, variant]);
    }
  }

  for (const key of keys) visit(key, []);

  for (const [key, rawOverride] of Object.entries(overrideRegistry)) {
    if (!keys.has(key)) {
      diagnostics.push({
        code: "unknown-runtime-override",
        severity: "error",
        variant: key,
        message: `App config overrides unknown variant "${key}". Register it in variants.registry first.`,
      });
      continue;
    }

    if (
      Array.isArray(rawOverride) ||
      (typeof rawOverride === "object" &&
        rawOverride !== null &&
        Object.prototype.hasOwnProperty.call(rawOverride, "extends"))
    ) {
      diagnostics.push({
        code: "runtime-extends",
        severity: "error",
        variant: key,
        message: `App config for variant "${key}" defines extends. Move structural inheritance to variants.registry.`,
      });
    }
  }

  return diagnostics;
}

export function assertValidVariantRegistry(
  baseRegistry: VariantRegistry,
  overrideRegistry: Record<string, unknown>,
): void {
  const diagnostics = collectVariantDiagnostics(baseRegistry, overrideRegistry);
  if (diagnostics.length > 0) throw new VariantRegistryError(diagnostics);
}
