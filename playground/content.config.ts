import { defineCollection } from "@nuxt/content";
import { z } from "zod";
import { variantGraph } from "./.nuxt/variants-graph.mjs";
import { mergeVariantSchemas, type SchemaRegistry } from "../src/runtime/utils/schemas";

const variantSchemas: SchemaRegistry = {
  seo: z.object({ seoTitle: z.string() }),
  article: z.object({ authorName: z.string() }),
};

export const collections = {
  blog: defineCollection({
    type: "page",
    source: "blog/**",
    schema: mergeVariantSchemas(["article"], variantSchemas, variantGraph),
  }),
};
