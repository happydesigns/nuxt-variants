import { defineContentPlugin, type ContentFile, type JsonSchema } from "comark-content";
import { type VariantKey, type VariantResolver, type VariantRegistryInput } from "./core";

declare module "comark-content" {
  interface ComarkFieldMetaRegistry {
    variant: {};
  }
}

/** A top-level document variant name; application domain fields stay in its schema. */
export function variantField(
  allowedVariants?: readonly string[],
): JsonSchema & { enum?: string[] } {
  return {
    type: "string",
    "x-content": { type: "variant" },
    ...(allowedVariants && { enum: [...allowedVariants] }),
  };
}

export interface VariantContentOptions<R extends VariantRegistryInput> {
  resolver: VariantResolver<R>;
  defaultVariant?: VariantKey<R>;
  /** Top-level frontmatter field. @default "variant" */
  field?: string;
}

type ContentSelection<R extends VariantRegistryInput, Name extends VariantKey<R>> = Omit<
  VariantContentOptions<R>,
  "defaultVariant"
> & {
  allowedVariants?: readonly Name[];
  defaultVariant?: NoInfer<Name>;
};

/** Content owns stored identity; the supplied resolver owns current config/features. */
export function variantContent<
  const R extends VariantRegistryInput,
  const Name extends VariantKey<NoInfer<R>>,
>(
  options: ContentSelection<R, Name> & { allowedVariants: readonly Name[] },
): ReturnType<typeof createVariantContent<R, Name>>;
export function variantContent<const R extends VariantRegistryInput>(
  options: VariantContentOptions<R> & { allowedVariants?: undefined },
): ReturnType<typeof createVariantContent<R, VariantKey<R>>>;
export function variantContent<const R extends VariantRegistryInput>(
  options: ContentSelection<R, VariantKey<R>>,
) {
  return createVariantContent(options);
}

function createVariantContent<R extends VariantRegistryInput, Name extends VariantKey<R>>(
  options: ContentSelection<R, Name>,
) {
  const { resolver, defaultVariant, allowedVariants, field = "variant" } = options;
  if (
    typeof field !== "string" ||
    !field ||
    ["__proto__", "constructor", "prototype"].includes(field)
  )
    throw new Error("[config-variants] Invalid Content variant field.");
  if (defaultVariant !== undefined && !resolver.isName(defaultVariant))
    throw new Error(`[config-variants] Unknown default variant "${defaultVariant}".`);
  if (
    allowedVariants !== undefined &&
    (!Array.isArray(allowedVariants) ||
      allowedVariants.length === 0 ||
      [...allowedVariants].some((name) => !resolver.isName(name)) ||
      new Set(allowedVariants).size !== allowedVariants.length)
  )
    throw new Error(
      "[config-variants] allowedVariants must contain distinct, registered variants.",
    );
  const names = allowedVariants ? [...allowedVariants] : resolver.names;
  const allowed = new Set<VariantKey<R>>(names);
  const expected = names.map((name) => JSON.stringify(name)).join(" | ");
  function isAllowed(name: VariantKey<R>): name is Name {
    return allowed.has(name);
  }
  if (defaultVariant !== undefined && !isAllowed(defaultVariant))
    throw new Error(
      `[config-variants] Default variant "${defaultVariant}" is outside ${expected}.`,
    );

  function identity(file: Pick<ContentFile, "data" | "meta">): Name {
    if (file.meta.kind !== "document")
      throw new Error("[config-variants] Variants apply to documents, not media files.");
    const stored = file.meta.variant;
    const name =
      file.data?.[field] ??
      (stored && typeof stored === "object" && "name" in stored ? stored.name : undefined) ??
      defaultVariant;
    if (!resolver.isName(name))
      throw new Error(
        `[config-variants] Unknown or missing variant "${String(name)}" in "${file.meta.key}".`,
      );
    if (!isAllowed(name))
      throw new Error(
        `[config-variants] Variant "${name}" is not allowed in "${file.meta.key}". Choose ${expected}.`,
      );
    return name;
  }
  type Methods = {
    resolveVariant: VariantResolver<R>["resolve"];
    variantName: typeof identity;
  };
  return defineContentPlugin<{}, Methods, { variant?: { name: Name } }>(() => ({
    name: "nuxt-variants",
    setup(content) {
      content.addFieldType("variant");
      function validateField(schema: JsonSchema | undefined, path: string[] = []): void {
        if (!schema) return;
        if (schema["x-content"]?.type === "variant") {
          if (path.length !== 1 || path[0] !== field)
            throw new Error(
              `[config-variants] variantField must annotate the configured top-level field "${field}".`,
            );
          const choices = "enum" in schema ? schema.enum : undefined;
          if (
            allowedVariants &&
            choices !== undefined &&
            (!Array.isArray(choices) ||
              choices.length !== names.length ||
              !names.every((name) => choices.includes(name)))
          )
            throw new Error("[config-variants] variantField choices must match allowedVariants.");
        }
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
              `[config-variants] variantField supports only the configured top-level field "${field}".`,
            );
          ctx.type = expected || "never";
        }
      });
      return { resolveVariant: resolver.resolve, variantName: identity };
    },
  }))();
}
