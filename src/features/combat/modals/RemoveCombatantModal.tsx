import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('combat')

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('removeCombatantTitle')}
      message={t('removeCombatantMessage', { name: combatantName })}
      icon={<Trash2 size={24} />}
      actionLabel={t('remove')}
      actionVariant="danger"
      onConfirm={handleConfirm}
    />
  )
}
