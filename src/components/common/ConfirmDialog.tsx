import type { ConfirmDialogProps } from '../../types/common'
import { BaseModal } from '../modals/BaseModal';
import { Button } from './Button';

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
            {loading ? 'Loading...' : actionLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
