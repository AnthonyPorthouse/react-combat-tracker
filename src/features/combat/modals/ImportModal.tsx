import { useState } from 'react'
import z from 'zod'
import { CombatValidator, type CombatState } from '../../../state/combatState'
import { verifyHmac } from '../../../utils/hmac'
import { BaseModal } from '../../../components/modals/BaseModal'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (state: CombatState) => void
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [base64Input, setBase64Input] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        const input = base64Input.trim()

        // Split by . to separate HMAC and base64 data
        const parts = input.split('.')
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          throw new Error(
            'Invalid format: missing HMAC or data. Please ensure you pasted the complete export string.'
          )
        }

        const [providedHmac, base64String] = parts

        // Verify HMAC before decoding
        const isValid = await verifyHmac(base64String, providedHmac)
        if (!isValid) {
          throw new Error(
            'Data integrity check failed. The data may have been modified.'
          )
        }

        // Decode base64
        const jsonString = atob(base64String)

        // Parse JSON
        const importedData = JSON.parse(jsonString)

        // Validate using CombatValidator
        const result = CombatValidator.safeParse(importedData)

        if (!result.success) {
          // Use z.flattenError() for human-readable error messages
          const { fieldErrors } = z.flattenError(result.error)
          const errorMessages = Object.entries(fieldErrors)
            .flatMap(([, messages]) => messages || [])
            .join('; ')
          throw new Error(errorMessages || 'Invalid combat state format.')
        }

        // Success - import the state
        onImport(result.data)
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
      title="Import Combat State"
      className="max-w-2xl"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!base64Input.trim() || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            {isLoading ? 'Importing...' : 'Import'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        Paste the HMAC-protected state from an export to restore your combat data. The integrity of the data will be verified before import.
      </p>

      <textarea
        value={base64Input}
        onChange={(e) => {
          setBase64Input(e.target.value)
          if (error) setError(null)
        }}
        placeholder="Paste your base64-encoded state here..."
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </BaseModal>
  )
}
