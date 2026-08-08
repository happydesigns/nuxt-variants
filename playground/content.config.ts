import { defineCollection } from "@nuxt/content";
import { createVariantGraph, mergeVariantSchemas } from "../src/runtime/utils/schemas";
import { z } from "zod";
import { variantRegistry } from "./variants";

const variantSchemas = {
  seo: z.object({ seoTitle: z.string() }),
  article: z.object({ authorName: z.string() }),
};
const variantGraph = createVariantGraph(variantRegistry);

export const collections = {
  blog: defineCollection({
    type: "page",
    source: "blog/**",
    schema: mergeVariantSchemas(["article"], variantSchemas, variantGraph),
  }),
};
