import type { AnyObjectSchema, SchemaAdapter } from './types'
import { zodAdapter } from './zod'
import { valibotAdapter } from './valibot'

function isZodSchema(s: unknown): boolean {
  return typeof s === 'object' && s !== null && ('_zod' in s || '_def' in s)
}

function isValibotSchema(s: unknown): boolean {
  return (
    typeof s === 'object'
    && s !== null
    && 'kind' in s
    && (s as { kind: unknown }).kind === 'schema'
  )
}

export function detectAdapter(schema: AnyObjectSchema): SchemaAdapter {
  if (isZodSchema(schema)) return zodAdapter as SchemaAdapter
  if (isValibotSchema(schema)) return valibotAdapter as SchemaAdapter
  throw new Error(
    '[nuxt-content-traits] Unrecognized schema type. '
    + 'Supported validators: Zod v4, Valibot. '
    + 'Ensure your schema is created with z.object() or v.object().',
  )
}
