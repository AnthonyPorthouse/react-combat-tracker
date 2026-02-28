import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BaseModal } from '../../../components/modals/BaseModal'
import { db } from '../../../db/db'
import { useToast } from '../../../state/toastContext'
import { parseImportString } from '../../../utils/importData'
import { LibraryValidator, type LibraryState } from '../libraryState'

interface ImportLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onImport?: (state: LibraryState) => void
}

/**
 * Imports a previously exported library string, merging categories and
 * creatures into the existing IndexedDB data.
 *
 * The import pipeline:
 * 1. Split on `.` to extract HMAC and base64 payload.
 * 2. Verify the HMAC — rejects tampered or corrupted strings.
 * 3. `atob` decode and `JSON.parse`.
 * 4. Validate against `LibraryValidator` — ensures both arrays have the
 *    correct structure before any write occurs.
 * 5. Write categories and creatures via `db.transaction('rw', ...)` with
 *    `bulkPut` — existing records with the same id are overwritten, new
 *    ids are inserted. This is a merge, not a replace: creatures already in
 *    the library but absent from the import are left untouched.
 *
 * The async work is wrapped in a synchronous `handleSubmit` that spawns it
 * internally — the same pattern used in `ImportModal` for the same reason
 * (React's `onSubmit` expects a synchronous handler).
 */
export function ImportLibraryModal({ isOpen, onClose, onImport }: ImportLibraryModalProps) {
  const [base64Input, setBase64Input] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('library')
  const { t: tCommon } = useTranslation('common')
  const { addToast } = useToast()

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        const data = await parseImportString(base64Input, LibraryValidator)

        await db.transaction('rw', db.categories, db.creatures, async () => {
          await db.categories.bulkPut(data.categories)
          await db.creatures.bulkPut(data.creatures)
        })

        onImport?.(data)
        setBase64Input('')
        addToast(t('toast.libraryImported'))
        onClose()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to import library'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    performImport()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('importLibraryTitle')}
      className="max-w-2xl"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!base64Input.trim() || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            {isLoading ? tCommon('importing') : tCommon('importAction')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-medium transition-colors"
          >
            {tCommon('cancel')}
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        {t('importDescription')}
      </p>

      <textarea
        id="import-library-data"
        name="import-library-data"
        aria-label={t('importPlaceholder')}
        value={base64Input}
        onChange={(e) => {
          setBase64Input(e.target.value)
          if (error) setError(null)
        }}
        placeholder={t('importPlaceholder')}
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-300 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </BaseModal>
  )
}
