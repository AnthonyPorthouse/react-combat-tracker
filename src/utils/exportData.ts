import { generateHmac } from './hmac'

/**
 * Serialises an arbitrary data object into a portable, HMAC-protected string.
 *
 * The output format is `<hmac>.<base64json>`, where the HMAC allows the
 * corresponding import flow to detect accidental corruption or manual edits
 * that occurred during copy-paste transfer.
 *
 * Pipeline: `data → JSON.stringify → UTF-8 encode → base64 → HMAC sign → concatenate`.
 *
 * The UTF-8 encoding step (via `TextEncoder`) ensures non-Latin-1 characters
 * such as emoji or CJK glyphs survive the round-trip — plain `btoa` would
 * throw on any codepoint above U+00FF.
 *
 * @param data - Any JSON-serialisable value to export.
 * @returns A string in `<hmac>.<base64>` format ready for display or clipboard copy.
 */
export async function createExportString(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data)
  const bytes = new TextEncoder().encode(jsonString)
  const base64String = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
  const hmac = await generateHmac(base64String)
  return `${hmac}.${base64String}`
}
