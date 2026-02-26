import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import type { CombatState } from '../../../state/combatState'
import { generateHmac } from '../../../utils/hmac'
import { BaseModal } from '../../../components/modals/BaseModal'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  state: CombatState
}

/**
 * Modal that serialises and displays the current combat state for export.
 *
 * The export string is formatted as `<hmac>.<base64json>`, where the HMAC
 * allows the import flow to detect corruption or manual edits. The full
 * pipeline is: `CombatState → JSON.stringify → btoa → HMAC sign → display`.
 *
 * The `useEffect` regenerates the export string every time `state` changes
 * so the displayed string is always up-to-date if the modal is left open
 * while the encounter progresses.
 *
 * A copy-to-clipboard button with a 2-second "Copied!" confirmation replaces
 * the need to manually select the textarea content, which is impractical on
 * mobile for long strings.
 */
export function ExportModal({ isOpen, onClose, state }: ExportModalProps) {
  const [copied, setCopied] = useState(false)
  const [exportData, setExportData] = useState<string>('')

  // Serialize state to JSON, then encode to base64, and prepend HMAC
  useEffect(() => {
    const generateExportData = async () => {
      const jsonString = JSON.stringify(state)
      const base64String = btoa(jsonString)
      const hmac = await generateHmac(base64String)
      setExportData(`${hmac}.${base64String}`)
    }

    generateExportData()
  }, [state])

  /**
   * Copies the export string to the clipboard and shows a brief confirmation.
   *
   * The 2-second timeout before reverting "Copied!" back to "Copy" gives
   * enough feedback that the action succeeded without the UI permanently
   * changing state. `console.error` is used (not thrown) because a clipboard
   * failure is non-critical — the user can still manually select and copy the
   * textarea text as a fallback.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Combat State"
      className="max-w-2xl"
      actions={
        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy to Clipboard
            </>
          )}
        </button>
      }
    >
      <p className="text-sm text-gray-600">
        Copy the HMAC-protected state below to save your combat data. You can import it later to restore the state. The integrity of your data is verified on import.
      </p>

      <textarea
        value={exportData}
        readOnly
        aria-label="Exported combat state JSON"
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 text-gray-700 focus:outline-none resize-none"
      />
    </BaseModal>
  )
}
