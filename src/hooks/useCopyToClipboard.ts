import { useState, useCallback } from 'react'
import { COPY_FEEDBACK_DURATION_MS } from '../utils/constants'

/**
 * Provides clipboard copy functionality with a timed "copied" confirmation.
 *
 * Encapsulates the `useState`, `setTimeout`, and `try/catch` boilerplate that
 * would otherwise be duplicated in every component with a "Copy to Clipboard"
 * action. If the clipboard API is unavailable the error is logged and `copied`
 * stays false, so the caller can still let the user manually select text.
 *
 * @returns `{ copied, copyToClipboard }` — the current confirmation state and
 *   the async function to trigger a copy.
 *
 * @example
 * const { copied, copyToClipboard } = useCopyToClipboard()
 * return <button onClick={() => copyToClipboard(text)}>{copied ? 'Copied!' : 'Copy'}</button>
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  return { copied, copyToClipboard }
}
