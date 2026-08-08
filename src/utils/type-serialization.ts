function serializeValueType(value: unknown): string {
  if (value === null) return "null";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";

    const elementTypes = [...new Set(value.map(serializeValueType))];
    const elementType =
      elementTypes.length === 1 ? elementTypes[0] : `(${elementTypes.join(" | ")})`;
    return `${elementType}[]`;
  }

  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return serializeConfigShape(value as Record<string, unknown>);
    default:
      return "unknown";
  }
}

/** Converts a JS config object into a TypeScript type literal widened to primitives. */
export function serializeConfigShape(config: Record<string, unknown>): string {
  const entries = Object.entries(config).map(
    ([key, value]) => `${JSON.stringify(key)}: ${serializeValueType(value)}`,
  );
  return entries.length ? `{ ${entries.join("; ")} }` : "{}";
}
