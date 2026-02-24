// Static secret key for HMAC generation
// In a production app with authentication, this could be derived from user credentials
const SECRET_KEY = 'combat-tracker-secret-key-v1'

/**
 * Generate HMAC-SHA256 for the given data
 * @param data - The data to generate HMAC for
 * @returns Promise<string> - Hex-encoded HMAC string
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
 * Verify HMAC-SHA256 for the given data
 * @param data - The data to verify
 * @param providedHmac - The HMAC to verify against
 * @returns Promise<boolean> - True if HMAC is valid, false otherwise
 */
export async function verifyHmac(
  data: string,
  providedHmac: string
): Promise<boolean> {
  const computedHmac = await generateHmac(data)
  return computedHmac === providedHmac
}
