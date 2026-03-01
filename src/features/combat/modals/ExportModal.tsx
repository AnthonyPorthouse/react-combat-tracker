import { useTranslation } from 'react-i18next'
import type { CombatState } from '../../../state/combatState'
import { BaseModal } from '../../../components/modals/BaseModal'
import { ExportActionButtons } from '../../../components/common'
import { useExportActions } from '../../../hooks'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  state: CombatState
}

/**
 * Modal that serialises the current combat state for export.
 *
 * The export payload is a MessagePack-encoded `Exportable<CombatState>` wrapped
 * in an HMAC-protected `<hmac>.<base64>` envelope. Two export paths are
 * available:
 *
 * - **Download** — triggers a `.ctdata` file download (primary path, least
 *   error-prone since the whole string is written automatically).
 * - **Copy** — copies the base64 string to the clipboard for sharing via
 *   text (secondary path, for paste-based imports).
 *
 * The export string is regenerated each time `state` changes so both buttons
 * are always in sync with the current encounter.
 */
export function ExportModal({ isOpen, onClose, state }: ExportModalProps) {
  const { t } = useTranslation('combat')
  const { exportString, handleDownload, handleCopy, copied } = useExportActions({
    exportType: 'combat',
    getData: () => Promise.resolve(state),
    filename: 'combat-export.ctdata',
    trigger: state,
  })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('exportTitle')}
      className="max-w-2xl"
      actions={
        <ExportActionButtons
          onDownload={handleDownload}
          onCopy={handleCopy}
          copied={copied}
          disabled={!exportString}
        />
      }
    >
      <p className="text-sm text-gray-600">
        {t('exportDescription')}
      </p>
    </BaseModal>
  )
}
