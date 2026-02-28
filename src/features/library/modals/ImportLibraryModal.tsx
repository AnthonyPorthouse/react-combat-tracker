import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button, FileDropzone } from '../../../components/common'
import { db } from '../../../db/db'
import { useToast } from '../../../state/toastContext'
import { parseImportString, parseImportBytes } from '../../../utils/importData'
import { LibraryValidator, type LibraryState } from '../libraryState'

interface ImportLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onImport?: (state: LibraryState) => void
}

/**
 * Imports a previously exported library, merging categories and creatures
 * into the existing IndexedDB data.
 *
 * Two import paths are offered:
 *
 * - **File upload (primary)** — accepts a `.ctdata` file. Raw bytes are
 *   passed to `parseImportBytes`, which decodes the MessagePack payload,
 *   verifies the HMAC, asserts `source === 'library'`, and validates the
 *   structure against `LibraryValidator`.
 * - **Paste (secondary)** — accepts the base64 `<hmac>.<base64>` string,
 *   delegating to `parseImportString` for the same pipeline.
 *
 * Both paths reject a combat export with a descriptive source-mismatch
 * error before any database write occurs.
 *
 * Data is merged via `bulkPut`: existing records with matching IDs are
 * overwritten; creatures and categories absent from the import are left
 * untouched.
 */
export function ImportLibraryModal({ isOpen, onClose, onImport }: ImportLibraryModalProps) {
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('library')
  const { t: tCommon } = useTranslation('common')
  const { addToast } = useToast()

  const hasInput = fileInput !== null || textInput.trim().length > 0

  const handleClose = () => {
    setFileInput(null)
    setTextInput('')
    setError(null)
    onClose()
  }

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        let data: LibraryState

        if (fileInput) {
          const buffer = await fileInput.arrayBuffer()
          data = await parseImportBytes(buffer, 'library', LibraryValidator)
        } else {
          data = await parseImportString(textInput, 'library', LibraryValidator)
        }

        await db.transaction('rw', db.categories, db.creatures, async () => {
          await db.categories.bulkPut(data.categories)
          await db.creatures.bulkPut(data.creatures)
        })

        onImport?.(data)
        addToast(t('toast.libraryImported'))
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import library')
      } finally {
        setIsLoading(false)
      }
    }

    performImport()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('importLibraryTitle')}
      className="max-w-2xl"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!hasInput || isLoading}
            className="flex-1 justify-center"
          >
            {isLoading ? tCommon('importing') : tCommon('importAction')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1 justify-center"
          >
            {tCommon('cancel')}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        {t('importDescription')}
      </p>

      <FileDropzone
        file={fileInput}
        accept={{ 'application/octet-stream': ['.ctdata'] }}
        onFile={(f) => { setFileInput(f); setError(null) }}
      />

      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 shrink-0">{tCommon('orPasteString')}</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <textarea
        id="import-library-data"
        name="import-library-data"
        aria-label={t('importPlaceholder')}
        value={textInput}
        onChange={(e) => {
          setTextInput(e.target.value)
          if (error) setError(null)
        }}
        placeholder={t('importPlaceholder')}
        className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-300 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </BaseModal>
  )
}

