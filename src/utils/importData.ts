import * as msgpack from '@msgpack/msgpack'
import type { ZodType } from 'zod'
import z from 'zod'
import { verifyHmac } from './hmac'
import { exportableValidator, type ExportSource } from './exportData'

/**
 * Shared internal pipeline for parsing an `<hmac>.<base64>` export string.
 *
 * Steps:
 * 1. Split on the first `.` to extract the HMAC and base64 payload.
 * 2. Verify the HMAC — rejects tampered or corrupted data.
 * 3. `atob`-decode the base64 back to raw bytes.
 * 4. Decode the bytes with MessagePack.
 * 5. Validate the outer `Exportable` wrapper via `exportableValidator`.
 * 6. Assert the `source` discriminator matches the expected value.
 * 7. Validate the inner `data` field with the caller-supplied Zod schema.
 *
 * Each failure surface produces a descriptive error so the user can diagnose
 * what went wrong (bad paste, truncated string, wrong export type, etc.).
 */
async function parseExportString<T>(
  raw: string,
  source: ExportSource,
  validator: ZodType<T>,
): Promise<T> {
  const trimmed = raw.trim()

  // Use indexOf to correctly handle the case where the base64 payload contains
  // a '.' character (MessagePack base64 output can include padding '=', not '.').
  const dotIndex = trimmed.indexOf('.')
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === trimmed.length - 1) {
    throw new Error(
      'Invalid format: missing HMAC or data. Please ensure you pasted the complete export string.',
    )
  }

  const providedHmac = trimmed.slice(0, dotIndex)
  const base64String = trimmed.slice(dotIndex + 1)

  const isValid = await verifyHmac(base64String, providedHmac)
  if (!isValid) {
    throw new Error('Data integrity check failed. The data may have been modified.')
  }

  const bytes = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0))
  const decoded = msgpack.decode(bytes)

  const outerResult = exportableValidator(validator).safeParse(decoded)
  if (!outerResult.success) {
    const { fieldErrors } = z.flattenError(outerResult.error)
    const errorMessages = Object.entries(fieldErrors)
      .flatMap(([, messages]) => messages || [])
      .join('; ')
    throw new Error(errorMessages || 'Invalid data format.')
  }

  if (outerResult.data.source !== source) {
    throw new Error(
      `Source mismatch: this file is a "${outerResult.data.source}" export and cannot be imported here.`,
    )
  }

  return outerResult.data.data
}

/**
 * Parses and validates an HMAC-protected export string (clipboard / paste path).
 *
 * Delegates to the shared `parseExportString` pipeline after checking source.
 *
 * @param input - The raw `<hmac>.<base64>` string pasted by the user.
 * @param source - The expected export source discriminator (`'combat'` | `'library'`).
 * @param validator - A Zod schema describing the expected shape of the inner data.
 * @returns The fully parsed and validated object of type `T`.
 * @throws {Error} With a human-readable message on any validation failure.
 */
export async function parseImportString<T>(
  input: string,
  source: ExportSource,
  validator: ZodType<T>,
): Promise<T> {
  return parseExportString(input, source, validator)
}

/**
 * Parses and validates an HMAC-protected export file (file upload path).
 *
 * The `.ctdata` file content is the UTF-8 encoding of the same `<hmac>.<base64>`
 * string produced by `createExportBytes`, so decoding to a string and delegating
 * to `parseExportString` provides a unified verification pipeline for both paths.
 *
 * @param buffer - The raw file bytes from a `FileReader` or `File.arrayBuffer()`.
 * @param source - The expected export source discriminator (`'combat'` | `'library'`).
 * @param validator - A Zod schema describing the expected shape of the inner data.
 * @returns The fully parsed and validated object of type `T`.
 * @throws {Error} With a human-readable message on any validation failure.
 */
export async function parseImportBytes<T>(
  buffer: ArrayBuffer | Uint8Array,
  source: ExportSource,
  validator: ZodType<T>,
): Promise<T> {
  const raw = new TextDecoder().decode(buffer)
  return parseExportString(raw, source, validator)
}
