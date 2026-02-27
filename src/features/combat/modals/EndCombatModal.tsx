import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'

interface EndCombatModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * Confirmation dialog shown before ending an active combat session.
 *
 * Ending combat is destructive — it clears all combatants from state and
 * resets round/step counters. This extra confirmation step prevents the DM
 * from accidentally wiping a running encounter with a misclick, especially
 * when the "End Combat" button sits near the navigation controls.
 */
export function EndCombatModal({
  isOpen,
  onClose,
  onConfirm,
}: EndCombatModalProps) {
  const { t } = useTranslation('combat')

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('endCombatTitle')}
      message={t('endCombatMessage')}
      icon={<AlertTriangle size={24} />}
      actionLabel={t('endCombatTitle')}
      actionVariant="danger"
      onConfirm={handleConfirm}
    />
  )
}
