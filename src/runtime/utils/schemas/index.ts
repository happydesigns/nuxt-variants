export { mergeVariantSchemas } from "./resolve";
export { createVariantGraph } from "../graph";
export type { VariantGraphEntryInput, VariantGraphRegistry } from "../graph";
export type { MergeVariantSchemasOptions, SchemaRegistry } from "./resolve";
export { zodAdapter, valibotAdapter, detectAdapter } from "./adapters";
export type {
  SchemaAdapter,
  AnyObjectSchema,
  ZodObjectSchema,
  ValibotObjectSchema,
} from "./adapters";
