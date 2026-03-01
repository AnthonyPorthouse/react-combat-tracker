import { Check, Copy, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface ExportActionButtonsProps {
  /** Called when the user clicks the download button. */
  onDownload: () => void
  /** Called when the user clicks the copy-to-clipboard button. */
  onCopy: () => void
  /**
   * When `true` the copy button briefly switches to a "Copied!" state,
   * giving the user tactile confirmation that the clipboard was written.
   */
  copied: boolean
  /**
   * When `true` both buttons are disabled.  Pass `!exportString` to prevent
   * interaction before the export data has been generated.
   */
  disabled: boolean
}

/**
 * A pair of action buttons — Download and Copy to Clipboard — used by every
 * export modal in the application.
 *
 * Extracted from the duplicate `actions=` prop blocks in `ExportModal` and
 * `ExportLibraryModal` so that button layout, icon swapping, and translation
 * keys live in one place.
 */
export function ExportActionButtons({ onDownload, onCopy, copied, disabled }: ExportActionButtonsProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex gap-3 w-full">
      <Button
        variant="primary"
        onClick={onDownload}
        disabled={disabled}
        icon={<Download size={18} />}
        className="flex-1 justify-center"
      >
        {t('download')}
      </Button>
      <Button
        variant="secondary"
        onClick={onCopy}
        disabled={disabled}
        icon={copied ? <Check size={18} /> : <Copy size={18} />}
        className="flex-1 justify-center"
      >
        {copied ? t('copied') : t('copyToClipboard')}
      </Button>
    </div>
  )
}
