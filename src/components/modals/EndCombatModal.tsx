import { AlertTriangle } from 'lucide-react'
import { BaseModal } from './BaseModal'

interface EndCombatModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function EndCombatModal({
  isOpen,
  onClose,
  onConfirm,
}: EndCombatModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="End Combat"
      className="max-w-lg"
      isClosable={false}
      actions={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            End Combat
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
      <div className="flex items-center gap-3 text-amber-700">
        <AlertTriangle size={20} />
        <p className="text-sm">
          End combat? This will remove all combatants.
        </p>
      </div>
    </BaseModal>
  )
}
