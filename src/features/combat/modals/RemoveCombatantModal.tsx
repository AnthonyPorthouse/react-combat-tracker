import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'

interface RemoveCombatantModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  combatantName: string
}

/**
 * Confirmation dialog shown before removing a combatant from an active encounter.
 *
 * Removal during combat shifts the turn pointer — if the removed combatant
 * held the current step, the next combatant will take over. This dialog
 * ensures the DM consciously confirms the action rather than removing someone
 * by mistake from the ⋮ action menu while trying to view their stats.
 */
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
