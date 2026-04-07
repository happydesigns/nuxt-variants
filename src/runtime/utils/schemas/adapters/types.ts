export interface SchemaAdapter<TSchema = unknown> {
  emptyObject(): TSchema
  merge(base: TSchema, extra: TSchema): TSchema
}

/**
 * Minimal structural type for Zod v3/v4 object schemas.
 * Only describes the properties accessed by adapter code.
 * The `~standard` property is part of the Standard Schema spec and is present
 * on all Zod schemas at runtime, making them compatible with consumers such as
 * Nuxt Content v3 that require a Standard Schema.
 */
export type ZodObjectSchema = {
  readonly _def?: unknown
  readonly _zod?: unknown
  readonly '~standard': StandardProps
  readonly shape: Record<string, unknown>
  extend(shape: Record<string, unknown>): ZodObjectSchema
}

/** Shared Standard Schema v1 `~standard` property shape, satisfied by both Zod and Valibot at runtime. */
type StandardProps = {
  readonly version: 1
  readonly vendor: string
  readonly validate: (value: unknown) =>
    | { readonly value: unknown; readonly issues?: undefined }
    | { readonly issues: ReadonlyArray<{ readonly message: string }> }
    | Promise<{ readonly value: unknown; readonly issues?: undefined } | { readonly issues: ReadonlyArray<{ readonly message: string }> }>
}

/**
 * Minimal structural type for Valibot object schemas.
 * Only describes the properties accessed by adapter code.
 * The `~standard` property is part of the Standard Schema spec and is present
 * on all Valibot schemas at runtime.
 */
export type ValibotObjectSchema = {
  readonly kind: 'schema'
  readonly type: 'object' | 'loose_object'
  readonly entries: Record<string, unknown>
  readonly '~standard': StandardProps
}

export type AnyObjectSchema = ZodObjectSchema | ValibotObjectSchema
