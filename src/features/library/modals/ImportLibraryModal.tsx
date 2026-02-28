import { useTranslation } from 'react-i18next'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button, ImportFormBody } from '../../../components/common'
import { db } from '../../../db/db'
import { useToast } from '../../../state/toastContext'
import { LibraryValidator, type LibraryState } from '../libraryState'
import { useImportForm } from '../../../hooks/useImportForm'

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
 *
 * Shared import state and pipeline logic live in `useImportForm`; shared
 * form markup lives in `ImportFormBody`.
 */
export function ImportLibraryModal({ isOpen, onClose, onImport }: ImportLibraryModalProps) {
  const { t } = useTranslation('library')
  const { t: tCommon } = useTranslation('common')
  const { addToast } = useToast()

  const {
    fileInput,
    setFileInput,
    textInput,
    setTextInput,
    error,
    setError,
    isLoading,
    hasInput,
    handleClose,
    handleSubmit,
  } = useImportForm({
    source: 'library',
    validator: LibraryValidator,
    onSuccess: async (data) => {
      await db.transaction('rw', db.categories, db.creatures, async () => {
        await db.categories.bulkPut(data.categories)
        await db.creatures.bulkPut(data.creatures)
      })
      onImport?.(data)
      addToast(t('toast.libraryImported'))
    },
    onClose,
  })

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

      <ImportFormBody
        fileInput={fileInput}
        onFile={setFileInput}
        textInput={textInput}
        onTextChange={setTextInput}
        error={error}
        onErrorClear={() => setError(null)}
        inputName="import-library-data"
        textareaLabel={t('importPlaceholder')}
      />
    </BaseModal>
  )
}

