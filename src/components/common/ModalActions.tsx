import type { ModalActionsProps } from '../../types/common'
import { Button } from './Button';

/**
 * Renders a consistent Submit / Cancel button pair for modal forms.
 *
 * Standardises the layout, spacing, and disabled/loading behaviour of modal
 * action footers so every form modal in the app behaves the same way.
 * The submit button uses `type="submit"` so it correctly triggers HTML form
 * validation and the `onSubmit` handler on the parent `<form>` without
 * callers needing to wire up an `onClick` separately.
 *
 * The `loading` prop disables both buttons simultaneously — cancelling is also
 * blocked to prevent closing a modal while an async operation is mid-flight.
 */
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
