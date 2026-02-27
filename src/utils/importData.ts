import type { ZodType } from 'zod'
import z from 'zod'
import { verifyHmac } from './hmac'

/**
 * Parses and validates an HMAC-protected import string.
 *
 * Performs the full reverse of `createExportString`:
 * 1. Splits on `.` to extract the HMAC and base64 payload.
 * 2. Verifies the HMAC — rejects tampered or corrupted strings.
 * 3. `atob`-decodes the base64 back to a JSON string.
 * 4. `JSON.parse`s the JSON.
 * 5. Validates the parsed object against the supplied Zod schema — rejects
 *    structurally invalid data before the caller ever sees it.
 *
 * Each failure surface produces a descriptive error so the user can diagnose
 * what went wrong (bad paste, truncated string, wrong export type, etc.).
 *
 * @param input - The raw `<hmac>.<base64>` string pasted by the user.
 * @param validator - A Zod schema describing the expected shape of the decoded data.
 * @returns The fully parsed and validated object of type `T`.
 * @throws {Error} With a human-readable message on any validation failure.
 */
export async function parseImportString<T>(
  input: string,
  validator: ZodType<T>,
): Promise<T> {
  const trimmed = input.trim()

  const parts = trimmed.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      'Invalid format: missing HMAC or data. Please ensure you pasted the complete export string.',
    )
  }

  const [providedHmac, base64String] = parts

  const isValid = await verifyHmac(base64String, providedHmac)
  if (!isValid) {
    throw new Error(
      'Data integrity check failed. The data may have been modified.',
    )
  }

  const bytes = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0))
  const jsonString = new TextDecoder().decode(bytes)
  const importedData = JSON.parse(jsonString)

  const result = validator.safeParse(importedData)
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error)
    const errorMessages = Object.entries(fieldErrors)
      .flatMap(([, messages]) => messages || [])
      .join('; ')
    throw new Error(errorMessages || 'Invalid data format.')
  }

  return result.data
}
