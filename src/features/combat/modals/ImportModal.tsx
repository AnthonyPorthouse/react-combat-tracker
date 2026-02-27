import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CombatValidator, type CombatState } from '../../../state/combatState'
import { parseImportString } from '../../../utils/importData'
import { BaseModal } from '../../../components/modals/BaseModal'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (state: CombatState) => void
}

/**
 * Modal for importing a previously exported combat state string.
 *
 * The import pipeline is the reverse of export and includes a full validation
 * chain to guard against corrupted or tampered strings:
 * 1. Split on `.` to extract HMAC and base64 payload.
 * 2. Re-compute the HMAC and compare — rejects if the payload was altered.
 * 3. `atob` decode the base64 back to a JSON string.
 * 4. `JSON.parse` the JSON.
 * 5. Validate the parsed object against `CombatValidator` — rejects
 *    structurally invalid data (wrong field types, missing fields, etc.).
 *
 * Each failure surface produces a specific user-readable error message so
 * the DM can diagnose what went wrong (bad paste, truncated string, etc.)
 * rather than seeing a generic failure.
 *
 * The async import is wrapped in a synchronous `handleSubmit` that spawns
 * the async function internally — required because React's `onSubmit` expects
 * a synchronous handler and `async` handlers would swallow uncaught rejections.
 */
export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [base64Input, setBase64Input] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('combat')

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        const data = await parseImportString(base64Input, CombatValidator)
        onImport(data)
        setBase64Input('')
        onClose()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to import state'
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
      title={t('importTitle')}
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
        id="import-data"
        name="import-data"
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
