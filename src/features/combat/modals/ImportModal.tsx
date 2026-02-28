import { useTranslation } from 'react-i18next'
import { CombatValidator, type CombatState } from '../../../state/combatState'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button, ImportFormBody } from '../../../components/common'
import { useImportForm } from '../../../hooks/useImportForm'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (state: CombatState) => void
}

/**
 * Modal for importing a previously exported combat state.
 *
 * Two import paths are offered to accommodate different sharing methods:
 *
 * - **File upload (primary)** — accepts a `.ctdata` file via a file picker.
 *   The raw bytes are passed to `parseImportBytes`, which decodes the
 *   MessagePack payload, verifies the HMAC, and validates the structure.
 * - **Paste (secondary)** — accepts the base64 `<hmac>.<base64>` string
 *   directly, delegating to `parseImportString` for the same pipeline.
 *
 * Both paths assert `source === 'combat'` before returning data, so a library
 * export pasted or dropped here is rejected with a descriptive error.
 *
 * The submit button is enabled as soon as either a file is selected or the
 * textarea contains text. If both are present, the file takes precedence.
 *
 * Shared import state and pipeline logic live in `useImportForm`; shared
 * form markup lives in `ImportFormBody`.
 */
export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

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
    source: 'combat',
    validator: CombatValidator,
    onSuccess: onImport,
    onClose,
  })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('importTitle')}
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
        inputName="import-data"
        textareaLabel={t('importPlaceholder')}
      />
    </BaseModal>
  )
}
