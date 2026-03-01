import { useTranslation } from 'react-i18next'
import { BaseModal } from '../../../components/modals/BaseModal'
import { ExportActionButtons } from '../../../components/common'
import { db } from '../../../db/db'
import { useExportActions } from '../../../hooks'

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
  const { t } = useTranslation('library')
  const { exportString, handleDownload, handleCopy, copied } = useExportActions({
    exportType: 'library',
    getData: async () => {
      const [categories, creatures] = await Promise.all([
        db.categories.toArray(),
        db.creatures.toArray(),
      ])
      return { categories, creatures }
    },
    filename: 'library-export.ctdata',
    trigger: isOpen,
  })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('exportLibraryTitle')}
      className="max-w-2xl"
      actions={
        <ExportActionButtons
          onDownload={handleDownload}
          onCopy={handleCopy}
          copied={copied}
          disabled={!exportString}
        />
      }
    >
      <p className="text-sm text-gray-600">
        {t('exportDescription')}
      </p>
    </BaseModal>
  )
}
