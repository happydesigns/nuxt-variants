export { createVariantSchemaResolver, mergeVariantSchemas } from "./runtime/utils/schemas/resolve";
export { createVariantGraph } from "./runtime/utils/graph";
export type {
  VariantGraph,
  VariantGraphEntryInput,
  VariantGraphRegistry,
} from "./runtime/utils/graph";
export { defineVariantRegistry } from "./runtime/utils/registry";
export type {
  VariantRegistryEntryInput,
  VariantRegistryEntryShorthand,
  VariantRegistryInput,
} from "./runtime/utils/registry";
export type {
  MergeVariantSchemasOptions,
  SchemaRegistry,
  VariantSchemaResolver,
} from "./runtime/utils/schemas/resolve";
export { zodAdapter, valibotAdapter, detectAdapter } from "./runtime/utils/schemas/adapters";
export type {
  SchemaAdapter,
  AnyObjectSchema,
  ZodObjectSchema,
  ValibotObjectSchema,
} from "./runtime/utils/schemas/adapters";
