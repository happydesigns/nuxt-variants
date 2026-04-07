export interface SchemaAdapter<TSchema = unknown> {
  emptyObject(): TSchema
  merge(base: TSchema, extra: TSchema): TSchema
}

/**
 * Minimal structural type for Zod v3/v4 object schemas.
 * Only describes the properties accessed by adapter code.
 */
export type ZodObjectSchema = {
  readonly _def?: unknown
  readonly _zod?: unknown
  merge(other: ZodObjectSchema): ZodObjectSchema
  extend(shape: Record<string, unknown>): ZodObjectSchema
}

/**
 * Minimal structural type for Valibot object schemas.
 * Only describes the properties accessed by adapter code.
 */
export type ValibotObjectSchema = {
  readonly kind: 'schema'
  readonly type: 'object' | 'loose_object'
  readonly entries: Record<string, unknown>
}

export type AnyObjectSchema = ZodObjectSchema | ValibotObjectSchema
