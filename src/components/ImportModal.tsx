import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import z from 'zod'
import { CombatValidator, type CombatState } from '../state/combat'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (state: CombatState) => void
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [base64Input, setBase64Input] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Decode base64
      const jsonString = atob(base64Input.trim())

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

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto m-4 md:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Import Combat State</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Paste the base64-encoded state from an export to restore your combat data.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  )
}
