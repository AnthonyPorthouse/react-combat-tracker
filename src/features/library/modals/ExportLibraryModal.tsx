import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button } from '../../../components/common'
import { db } from '../../../db/db'
import { createExportString } from '../../../utils/exportData'
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
        const result = await createExportString({ categories, creatures })
        setExportData(result)
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
      title={t('exportLibraryTitle')}
      className="max-w-2xl"
      actions={
        <Button
          variant="primary"
          onClick={handleCopy}
          disabled={!exportData}
          icon={copied ? <Check size={18} /> : <Copy size={18} />}
          className="w-full justify-center"
        >
          {copied ? tCommon('copied') : tCommon('copyToClipboard')}
        </Button>
      }
    >
      <p className="text-sm text-gray-600">
        {t('exportDescription')}
      </p>

      <textarea
        id="export-library-data"
        name="export-library-data"
        value={exportData}
        readOnly
        aria-label={t('exportedLibraryJson')}
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 text-gray-700 focus:outline-none resize-none"
      />
    </BaseModal>
  )
}
