import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import z from 'zod'
import { BaseModal } from '../../../components/modals/BaseModal'
import { db } from '../../../db/db'
import { verifyHmac } from '../../../utils/hmac'
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

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        const input = base64Input.trim()

        const parts = input.split('.')
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          throw new Error(
            'Invalid format: missing HMAC or data. Please ensure you pasted the complete export string.'
          )
        }

        const [providedHmac, base64String] = parts

        const isValid = await verifyHmac(base64String, providedHmac)
        if (!isValid) {
          throw new Error(
            'Data integrity check failed. The data may have been modified.'
          )
        }

        const jsonString = atob(base64String)
        const importedData = JSON.parse(jsonString)

        const result = LibraryValidator.safeParse(importedData)

        if (!result.success) {
          const { fieldErrors } = z.flattenError(result.error)
          const errorMessages = Object.entries(fieldErrors)
            .flatMap(([, messages]) => messages || [])
            .join('; ')
          throw new Error(errorMessages || 'Invalid library state format.')
        }

        await db.transaction('rw', db.categories, db.creatures, async () => {
          await db.categories.bulkPut(result.data.categories)
          await db.creatures.bulkPut(result.data.creatures)
        })

        onImport?.(result.data)
        setBase64Input('')
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
            {isLoading ? t('importing') : t('importAction')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-medium transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        {t('importDescription')}
      </p>

      <textarea
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
