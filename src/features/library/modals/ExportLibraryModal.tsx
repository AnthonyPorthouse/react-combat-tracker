import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { db } from '../../../db/db'
import { generateHmac } from '../../../utils/hmac'

interface ExportLibraryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportLibraryModal({ isOpen, onClose }: ExportLibraryModalProps) {
  const [copied, setCopied] = useState(false)
  const [exportData, setExportData] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const generateExportData = async () => {
      try {
        const [categories, creatures] = await Promise.all([
          db.categories.toArray(),
          db.creatures.toArray(),
        ])
        const jsonString = JSON.stringify({ categories, creatures })
        const base64String = btoa(jsonString)
        const hmac = await generateHmac(base64String)
        setExportData(`${hmac}.${base64String}`)
      } catch (err) {
        console.error('Failed to generate library export:', err)
        setExportData('')
      }
    }

    generateExportData()
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Library"
      className="max-w-2xl"
      actions={
        <button
          onClick={handleCopy}
          disabled={!exportData}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
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
      }
    >
      <p className="text-sm text-gray-600">
        Copy the HMAC-protected library state below to save your creatures and categories. You can import it later to restore the library. The integrity of your data is verified on import.
      </p>

      <textarea
        value={exportData}
        readOnly
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 text-gray-700 focus:outline-none resize-none"
      />
    </BaseModal>
  )
}
