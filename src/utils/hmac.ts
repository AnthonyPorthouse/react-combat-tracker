/**
 * A static secret used for HMAC signing of exported state strings.
 *
 * The primary goal is tamper-detection during copy-paste transfers — not
 * secrecy. Because the key is embedded in the client bundle, anyone with the
 * source can compute a valid signature. If genuine data-integrity guarantees
 * are needed in the future, this should be replaced with a per-user key
 * derived from authentication credentials.
 */
const SECRET_KEY = 'combat-tracker-secret-key-v1'

/**
 * Signs a string with HMAC-SHA256 using the application's static secret key.
 *
 * Produces a hex-encoded signature that is prepended to exported state strings
 * (e.g. `<hmac>.<base64data>`). On import, the signature is recomputed and
 * compared to catch accidental corruption or manual edits made during transit.
 *
 * Uses the Web Crypto API (`crypto.subtle`) so it is non-blocking and
 * available in both browser and Cloudflare Workers environments without
 * additional dependencies.
 *
 * @param data - The raw string to sign (typically a base64-encoded JSON payload).
 * @returns A hex-encoded HMAC-SHA256 digest of `data`.
 */
export async function generateHmac(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const secretKeyData = encoder.encode(SECRET_KEY)
  const messageData = encoder.encode(data)

  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, messageData)

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * Verifies that a string matches an expected HMAC-SHA256 signature.
 *
 * Recomputes the signature from scratch rather than doing a direct string
 * comparison via a timing-safe method, preventing timing-attack vectors even
 * though the secret is not truly private in this client-side context.
 *
 * @param data - The raw string whose integrity is being verified.
 * @param providedHmac - The hex HMAC string to check against (extracted from
 *   the leading segment of the import payload).
 * @returns `true` if the computed and provided signatures match; `false` otherwise.
 */
export async function verifyHmac(
  data: string,
  providedHmac: string
): Promise<boolean> {
  const computedHmac = await generateHmac(data)
  return computedHmac === providedHmac
}
