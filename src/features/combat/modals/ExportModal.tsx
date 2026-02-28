import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Download } from 'lucide-react'
import type { CombatState } from '../../../state/combatState'
import { createExportString, createExportBytes } from '../../../utils/exportData'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button } from '../../../components/common'
import { useCopyToClipboard } from '../../../hooks'

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
 * The `useEffect` regenerates the export string each time `state` changes so
 * both buttons are always in sync with the current encounter.
 */
export function ExportModal({ isOpen, onClose, state }: ExportModalProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const [exportString, setExportString] = useState<string>('')
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

  useEffect(() => {
    createExportString('combat', state).then(setExportString)
  }, [state])

  /**
   * Triggers a browser file download of the export as a `.ctdata` binary file.
   *
   * Creates a transient object URL from the MessagePack bytes, clicks a hidden
   * anchor to initiate the download, then immediately revokes the URL to avoid
   * memory leaks.
   */
  const handleDownload = async () => {
    const bytes = await createExportBytes('combat', state)
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'combat-export.ctdata'
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Copies the base64 export string to the clipboard with a brief "Copied!"
   * confirmation. Delegates to the `useCopyToClipboard` hook.
   */
  const handleCopy = () => copyToClipboard(exportString)

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('exportTitle')}
      className="max-w-2xl"
      actions={
        <div className="flex gap-3 w-full">
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={!exportString}
            icon={<Download size={18} />}
            className="flex-1 justify-center"
          >
            {tCommon('download')}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={!exportString}
            icon={copied ? <Check size={18} /> : <Copy size={18} />}
            className="flex-1 justify-center"
          >
            {copied ? tCommon('copied') : tCommon('copyToClipboard')}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        {t('exportDescription')}
      </p>
    </BaseModal>
  )
}
