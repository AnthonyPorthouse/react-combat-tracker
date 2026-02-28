import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CombatValidator, type CombatState } from '../../../state/combatState'
import { parseImportString, parseImportBytes } from '../../../utils/importData'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button, FileDropzone } from '../../../components/common'

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
 */
export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

  const hasInput = fileInput !== null || textInput.trim().length > 0

  const handleClose = () => {
    setFileInput(null)
    setTextInput('')
    setError(null)
    onClose()
  }

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        let data: CombatState

        if (fileInput) {
          const buffer = await fileInput.arrayBuffer()
          data = await parseImportBytes(buffer, 'combat', CombatValidator)
        } else {
          data = await parseImportString(textInput, 'combat', CombatValidator)
        }

        onImport(data)
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import state')
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
        id="import-data"
        name="import-data"
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
