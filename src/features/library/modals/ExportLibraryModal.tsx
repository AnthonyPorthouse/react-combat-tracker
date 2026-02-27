import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button } from '../../../components/common'
import { db } from '../../../db/db'
import { generateHmac } from '../../../utils/hmac'
import { useCopyToClipboard } from '../../../hooks'

interface ExportLibraryModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Exports the entire creature library (all categories and creatures) as a
 * portable HMAC-protected string.
 *
 * The export pipeline mirrors the combat state export: categories and
 * creatures are fetched directly from IndexedDB (not from a live query,
 * since this is a one-shot async read), serialised as JSON, base64-encoded,
 * and signed with an HMAC.
 *
 * The `useEffect` only triggers when `isOpen` changes to `true`, avoiding
 * unnecessary database reads while the modal is closed. If the database read
 * fails, `exportData` is cleared and the copy button is disabled rather than
 * showing an error-state string.
 *
 * Useful for backup/restore workflows, sharing creature libraries between
 * DMs, or migrating data to a new browser/device.
 */
export function ExportLibraryModal({ isOpen, onClose }: ExportLibraryModalProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const [exportData, setExportData] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const generateExportData = async () => {
      try {
        const [categories, creatures] = await Promise.all([
          db.categories.toArray(),
          db.creatures.toArray(),
        ])
        const jsonString = JSON.stringify({ categories, creatures })
        const base64String = btoa(jsonString)
        const hmac = await generateHmac(base64String)
        setExportData(`${hmac}.${base64String}`)
      } catch (err) {
        console.error('Failed to generate library export:', err)
        setExportData('')
      }
    }

    generateExportData()
  }, [isOpen])

  /**
   * Copies the export string to the clipboard with a brief "Copied!" confirmation.
   * Delegates to the `useCopyToClipboard` hook, which mirrors the same pattern
   * used in `ExportModal` for combat state export.
   */
  const handleCopy = () => copyToClipboard(exportData)

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Library"
      className="max-w-2xl"
      actions={
        <Button
          variant="primary"
          onClick={handleCopy}
          disabled={!exportData}
          icon={copied ? <Check size={18} /> : <Copy size={18} />}
          className="w-full justify-center"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      }
    >
      <p className="text-sm text-gray-600">
        Copy the HMAC-protected library state below to save your creatures and categories. You can import it later to restore the library. The integrity of your data is verified on import.
      </p>

      <textarea
        value={exportData}
        readOnly
        aria-label="Exported library JSON"
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 text-gray-700 focus:outline-none resize-none"
      />
    </BaseModal>
  )
}
