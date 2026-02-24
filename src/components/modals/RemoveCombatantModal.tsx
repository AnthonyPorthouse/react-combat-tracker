import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'

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
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Combatant"
      message={`Remove ${combatantName} from combat?`}
      icon={<Trash2 size={24} />}
      actionLabel="Remove"
      actionVariant="danger"
      onConfirm={handleConfirm}
    />
  )
}
