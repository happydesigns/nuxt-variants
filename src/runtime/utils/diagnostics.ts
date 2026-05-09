import { getVariantExtends, type VariantRegistry } from "./variants";

export type VariantDiagnosticCode = "unknown-parent" | "circular-extends" | "override-extends";

export interface VariantDiagnostic {
  code: VariantDiagnosticCode;
  severity: "warning";
  variant: string;
  parent?: string;
  path?: string[];
  message: string;
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function collectVariantDiagnostics(
  baseRegistry: VariantRegistry,
  overrideRegistry: VariantRegistry,
): VariantDiagnostic[] {
  const diagnostics: VariantDiagnostic[] = [];
  const keys = new Set([...Object.keys(baseRegistry), ...Object.keys(overrideRegistry)]);
  const graph = Object.fromEntries(
    [...keys].map((key) => [key, getVariantExtends(key, baseRegistry, overrideRegistry)]),
  );

  for (const [variant, parents] of Object.entries(graph)) {
    for (const parent of parents) {
      if (!keys.has(parent)) {
        diagnostics.push({
          code: "unknown-parent",
          severity: "warning",
          variant,
          parent,
          message: `Variant "${variant}" extends unknown variant "${parent}".`,
        });
      }
    }
  }

  const emittedCycles = new Set<string>();

  function visit(variant: string, path: string[]): void {
    const existingIndex = path.indexOf(variant);
    if (existingIndex !== -1) {
      const cycle = [...path.slice(existingIndex), variant];
      const key = cycle.join(" -> ");
      if (!emittedCycles.has(key)) {
        emittedCycles.add(key);
        diagnostics.push({
          code: "circular-extends",
          severity: "warning",
          variant,
          path: cycle,
          message: `Variant inheritance cycle detected: ${key}.`,
        });
      }
      return;
    }

    for (const parent of graph[variant] ?? []) {
      if (keys.has(parent)) visit(parent, [...path, variant]);
    }
  }

  for (const key of keys) visit(key, []);

  for (const key of keys) {
    const baseExtends = baseRegistry[key]?.extends;
    const overrideExtends = overrideRegistry[key]?.extends;
    if (baseExtends === undefined || overrideExtends === undefined) continue;

    const baseParents = getVariantExtends(key, baseRegistry, {});
    const overrideParents = getVariantExtends(key, {}, overrideRegistry);
    if (arraysEqual(baseParents, overrideParents)) continue;

    diagnostics.push({
      code: "override-extends",
      severity: "warning",
      variant: key,
      message: `App config for variant "${key}" replaces the base extends chain.`,
    });
  }

  return diagnostics;
}
