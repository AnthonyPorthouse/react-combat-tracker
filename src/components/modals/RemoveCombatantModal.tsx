import { Trash2 } from 'lucide-react'
import { BaseModal } from '../modals/BaseModal'

interface RemoveCombatantModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  combatantName: string
}

export function RemoveCombatantModal({
  isOpen,
  onClose,
  onConfirm,
  combatantName,
}: RemoveCombatantModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Combatant"
      className="max-w-md"
      isClosable={false}
      actions={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Remove
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
      <div className="flex items-center gap-3 text-red-700">
        <Trash2 size={20} />
        <p className="text-sm">
          Remove <span className="font-semibold">{combatantName}</span> from the combatants list?
        </p>
      </div>
    </BaseModal>
  )
}
