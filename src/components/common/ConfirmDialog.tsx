import { useTranslation } from 'react-i18next'
import type { ConfirmDialogProps } from '../../types/common'
import { BaseModal } from '../modals/BaseModal';
import { Button } from './Button';

/**
 * A reusable confirmation dialog for destructive or irreversible actions.
 *
 * Wraps `BaseModal` with a standardised layout — centred icon, bold title,
 * explanatory message, and a pair of action/cancel buttons — so every
 * confirm prompt in the app looks and behaves consistently without repeating
 * the same modal scaffold. The `actionVariant` prop lets callers signal
 * intent: `'danger'` for deletions, `'primary'` or `'success'` for
 * confirmations that are additive.
 *
 * The `loading` prop disables both buttons during async operations to prevent
 * double-submission while still showing the dialog.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  icon,
  actionLabel,
  actionVariant = 'primary',
  onConfirm,
  disabled = false,
  loading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation('common')
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-4">
        {icon && (
          <div className="flex justify-center text-4xl text-gray-600">
            {icon}
          </div>
        )}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            variant={actionVariant}
            onClick={onConfirm}
            disabled={disabled || loading}
            className="flex-1"
          >
            {loading ? t('loading') : actionLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
