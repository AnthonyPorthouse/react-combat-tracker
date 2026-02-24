import type { ModalActionsProps } from '../../types/common'
import { Button } from './Button';

export function ModalActions({
  primaryLabel,
  primaryVariant = 'primary',
  onCancel,
  disabled = false,
  loading = false,
}: ModalActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        type="submit"
        variant={primaryVariant}
        disabled={disabled || loading}
        className="flex-1"
      >
        {loading ? 'Loading...' : primaryLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={loading}
        className="flex-1"
      >
        Cancel
      </Button>
    </div>
  );
}
