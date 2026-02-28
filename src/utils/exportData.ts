import * as msgpack from '@msgpack/msgpack'
import z from 'zod'
import { generateHmac } from './hmac'

/**
 * The discriminated union of valid export source identifiers.
 *
 * Used as the `source` field in every exported payload to enable fast
 * origin checks during import — e.g. rejecting a library export pasted
 * into the combat import dialog before the inner Zod validator even runs.
 */
export type ExportSource = 'combat' | 'library'

/**
 * Factory function creating a fully-typed Zod schema for the common export
 * wrapper.
 *
 * A factory rather than a static schema is used so the caller can supply
 * their own inner Zod schema for `data`, letting TypeScript infer the full
 * `Exportable<T>` type end-to-end without an `unknown` escape hatch.
 *
 * @example
 * const schema = exportableValidator(CombatValidator)
 * // infers as z.ZodObject<{ source: z.ZodEnum<...>, data: typeof CombatValidator }>
 */
export const exportableValidator = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    source: z.enum(['combat', 'library']),
    data: dataSchema,
  })

/** The common wrapper type for all exported data. */
export type Exportable<T> = {
  source: ExportSource
  data: T
}

/**
 * Shared internal pipeline: wraps data in the Exportable envelope, encodes
 * it with MessagePack, base64-encodes the bytes, then signs the base64 string
 * with HMAC-SHA256.
 *
 * Both `createExportString` and `createExportBytes` delegate here so the
 * HMAC always covers the same base64 representation — keeping a single
 * unified verification pathway regardless of whether the data is consumed
 * as a file or a clipboard string.
 */
async function buildExportString<T>(source: ExportSource, data: T): Promise<string> {
  const payload: Exportable<T> = { source, data }
  const bytes = msgpack.encode(payload)
  const base64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
  const hmac = await generateHmac(base64)
  return `${hmac}.${base64}`
}

/**
 * Serialises an exportable data object into a portable, HMAC-protected string.
 *
 * Output format: `<hmac>.<base64msgpack>`
 * Pipeline: `{ source, data }` → msgpack encode → base64 → HMAC sign → concatenate
 *
 * The resulting string is safe for clipboard storage and can be imported back
 * via `parseImportString` in `importData.ts`.
 */
export async function createExportString<T>(source: ExportSource, data: T): Promise<string> {
  return buildExportString(source, data)
}

/**
 * Serialises an exportable data object into raw bytes suitable for file download.
 *
 * The file content is the UTF-8 encoding of the same `<hmac>.<base64>` string
 * produced by `createExportString`. Sharing the same textual encoding for both
 * paths means `parseImportBytes` can simply decode to a string and delegate
 * to the string-import pipeline — no separate binary verification logic needed.
 *
 * Recommended file extension: `.ctdata`
 */
export async function createExportBytes<T>(source: ExportSource, data: T): Promise<Uint8Array> {
  const str = await buildExportString(source, data)
  return new TextEncoder().encode(str)
}
