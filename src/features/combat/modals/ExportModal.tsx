import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
import type { CombatState } from '../../../state/combatState'
import { createExportString } from '../../../utils/exportData'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button } from '../../../components/common'
import { useCopyToClipboard } from '../../../hooks'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  state: CombatState
}

/**
 * Modal that serialises and displays the current combat state for export.
 *
 * The export string is formatted as `<hmac>.<base64json>`, where the HMAC
 * allows the import flow to detect corruption or manual edits. The full
 * pipeline is: `CombatState → JSON.stringify → btoa → HMAC sign → display`.
 *
 * The `useEffect` regenerates the export string every time `state` changes
 * so the displayed string is always up-to-date if the modal is left open
 * while the encounter progresses.
 *
 * A copy-to-clipboard button with a 2-second "Copied!" confirmation replaces
 * the need to manually select the textarea content, which is impractical on
 * mobile for long strings.
 */
export function ExportModal({ isOpen, onClose, state }: ExportModalProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const [exportData, setExportData] = useState<string>('')
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

  useEffect(() => {
    createExportString(state).then(setExportData)
  }, [state])

  /**
   * Copies the export string to the clipboard and shows a brief confirmation.
   *
   * The `useCopyToClipboard` hook manages the timed "Copied!" feedback and
   * error handling. `console.error` is used (not thrown) because a clipboard
   * failure is non-critical — the user can still manually select and copy the
   * textarea text as a fallback.
   */
  const handleCopy = () => copyToClipboard(exportData)

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('exportTitle')}
      className="max-w-2xl"
      actions={
        <Button
          variant="primary"
          onClick={handleCopy}
          icon={copied ? <Check size={18} /> : <Copy size={18} />}
          className="w-full justify-center"
        >
          {copied ? tCommon('copied') : tCommon('copyToClipboard')}
        </Button>
      }
    >
      <p className="text-sm text-gray-600">
        {t('exportDescription')}
      </p>

      <textarea
        id="export-data"
        name="export-data"
        value={exportData}
        readOnly
        aria-label={t('exportedJson')}
        className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 text-gray-700 focus:outline-none resize-none"
      />
    </BaseModal>
  )
}
