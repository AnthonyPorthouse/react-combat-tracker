import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Download } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button } from '../../../components/common'
import { db } from '../../../db/db'
import { createExportString, createExportBytes } from '../../../utils/exportData'
import { useCopyToClipboard } from '../../../hooks'

interface ExportLibraryModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Exports the entire creature library (all categories and creatures) as a
 * portable HMAC-protected MessagePack file or clipboard string.
 *
 * Categories and creatures are fetched directly from IndexedDB in a one-shot
 * async read when the modal opens. The payload is wrapped in an `Exportable`
 * envelope with `source: 'library'` before encoding, so the import flow can
 * quickly reject mismatched export types (e.g. a combat export pasted into
 * the library importer).
 *
 * Two export paths are available:
 * - **Download** — triggers a `.ctdata` file download (primary).
 * - **Copy** — copies the base64 string for paste-based imports (secondary).
 *
 * If the database read fails, both buttons are disabled rather than showing
 * an error-state string.
 *
 * Useful for backup/restore workflows, sharing creature libraries between
 * DMs, or migrating data to a new browser/device.
 */
export function ExportLibraryModal({ isOpen, onClose }: ExportLibraryModalProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const [exportString, setExportString] = useState('')
  const [libraryData, setLibraryData] = useState<{ categories: Awaited<ReturnType<typeof db.categories.toArray>>, creatures: Awaited<ReturnType<typeof db.creatures.toArray>> } | null>(null)
  const { t } = useTranslation('library')
  const { t: tCommon } = useTranslation('common')

  useEffect(() => {
    if (!isOpen) return

    const generateExportData = async () => {
      try {
        const [categories, creatures] = await Promise.all([
          db.categories.toArray(),
          db.creatures.toArray(),
        ])
        const data = { categories, creatures }
        setLibraryData(data)
        const result = await createExportString('library', data)
        setExportString(result)
      } catch (err) {
        console.error('Failed to generate library export:', err)
        setExportString('')
        setLibraryData(null)
      }
    }

    generateExportData()
  }, [isOpen])

  /**
   * Triggers a browser file download of the library export as a `.ctdata` file.
   *
   * Uses the already-fetched `libraryData` to avoid a second IndexedDB read.
   * Creates a transient object URL, clicks a hidden anchor, then revokes the
   * URL to avoid memory leaks.
   */
  const handleDownload = async () => {
    if (!libraryData) return
    const bytes = await createExportBytes('library', libraryData)
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'library-export.ctdata'
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Copies the base64 export string to the clipboard with a brief "Copied!"
   * confirmation. Delegates to the `useCopyToClipboard` hook.
   */
  const handleCopy = () => copyToClipboard(exportString)

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('exportLibraryTitle')}
      className="max-w-2xl"
      actions={
        <div className="flex gap-3 w-full">
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={!exportString}
            icon={<Download size={18} />}
            className="flex-1 justify-center"
          >
            {tCommon('download')}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={!exportString}
            icon={copied ? <Check size={18} /> : <Copy size={18} />}
            className="flex-1 justify-center"
          >
            {copied ? tCommon('copied') : tCommon('copyToClipboard')}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        {t('exportDescription')}
      </p>
    </BaseModal>
  )
}
