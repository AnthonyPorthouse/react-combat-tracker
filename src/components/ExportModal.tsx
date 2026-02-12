import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Check } from 'lucide-react'
import type { CombatState } from '../state/combat'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  state: CombatState
}

export function ExportModal({ isOpen, onClose, state }: ExportModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Serialize state to JSON, then encode to base64
  const jsonString = JSON.stringify(state)
  const base64String = btoa(jsonString)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(base64String)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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
          <h2 className="text-lg font-bold text-gray-900">Export Combat State</h2>
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
            Copy the base64-encoded state below to save your combat data. You can import it later to restore the state.
          </p>

          <textarea
            value={base64String}
            readOnly
            className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 text-gray-700 focus:outline-none resize-none"
          />

          <button
            onClick={handleCopy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  )
}
