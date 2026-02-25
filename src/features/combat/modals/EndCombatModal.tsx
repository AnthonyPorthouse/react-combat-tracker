import { AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'

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
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="End Combat"
      message="End combat? This will remove all combatants."
      icon={<AlertTriangle size={24} />}
      actionLabel="End Combat"
      actionVariant="danger"
      onConfirm={handleConfirm}
    />
  )
}
