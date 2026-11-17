import { defineContentPlugin, type ContentFile, type JsonSchema } from "comark-content";
import { type VariantKey, type VariantResolver, type VariantRegistryInput } from "./core";

declare module "comark-content" {
  interface ComarkFieldMetaRegistry {
    variant: {};
  }
}

/** A top-level document variant name; application domain fields stay in its schema. */
export function variantField(): JsonSchema {
  return { type: "string", "x-content": { type: "variant" } };
}

export interface VariantContentOptions<R extends VariantRegistryInput> {
  resolver: VariantResolver<R>;
  defaultVariant?: VariantKey<R>;
  /** Top-level frontmatter field. @default "variant" */
  field?: string;
}

/** Content owns stored identity; the supplied resolver owns current config/features. */
export function variantContent<const R extends VariantRegistryInput>(
  options: VariantContentOptions<R>,
) {
  const { resolver, defaultVariant, field = "variant" } = options;
  if (
    typeof field !== "string" ||
    !field ||
    ["__proto__", "constructor", "prototype"].includes(field)
  )
    throw new Error("[nuxt-variants] Invalid Content variant field.");
  if (defaultVariant !== undefined && !resolver.isName(defaultVariant))
    throw new Error(`[nuxt-variants] Unknown default variant "${defaultVariant}".`);
  function identity(file: Pick<ContentFile, "data" | "meta">): VariantKey<R> {
    if (file.meta.kind !== "document")
      throw new Error("[nuxt-variants] Variants apply to documents, not media files.");
    const stored = file.meta.variant;
    const name =
      file.data?.[field] ??
      (stored && typeof stored === "object" && "name" in stored ? stored.name : undefined) ??
      defaultVariant;
    if (!resolver.isName(name))
      throw new Error(
        `[nuxt-variants] Unknown or missing variant "${String(name)}" in "${file.meta.key}".`,
      );
    return name;
  }
  type Methods = {
    resolveVariant: VariantResolver<R>["resolve"];
    variantName: typeof identity;
  };
  return defineContentPlugin<{}, Methods, { variant?: { name: VariantKey<R> } }>(() => ({
    name: "nuxt-variants",
    setup(content) {
      content.addFieldType("variant");
      function validateField(schema: JsonSchema | undefined, path: string[] = []): void {
        if (!schema) return;
        if (schema["x-content"]?.type === "variant" && (path.length !== 1 || path[0] !== field))
          throw new Error(
            `[nuxt-variants] variantField must annotate the configured top-level field "${field}".`,
          );
        for (const [key, child] of Object.entries(schema.properties ?? {}))
          validateField(child, [...path, key]);
        if (schema.items) validateField(schema.items, [...path, "*"]);
      }
      // A source schema is structural: validate it once, not per document.
      validateField(content.getSource()?.schema);
      content.hooks.hook("file:parsed", ({ file }) => {
        if (file?.meta.kind !== "document") return;
        file.meta.variant = { name: identity(file) };
      });
      content.hooks.hook("typegen:field", (ctx) => {
        // Query-row schemas deliberately strip semantic metadata. Resolve a
        // top-level field back to its explicit source schema in that case.
        const original =
          ctx.layer === "row" && ctx.path.length === 1 && ctx.path[0]?.startsWith("data.")
            ? content.getSource(ctx.source)?.schema?.properties?.[ctx.path[0].slice(5)]
            : ctx.schema;
        if (original?.["x-content"]?.type === "variant") {
          if (
            ctx.path.length !== 1 ||
            ctx.path[0] !== (ctx.layer === "row" ? `data.${field}` : field)
          )
            throw new Error(
              `[nuxt-variants] variantField supports only the configured top-level field "${field}".`,
            );
          ctx.type = resolver.names.map((name) => JSON.stringify(name)).join(" | ") || "never";
        }
      });
      return { resolveVariant: resolver.resolve, variantName: identity };
    },
  }))();
}
