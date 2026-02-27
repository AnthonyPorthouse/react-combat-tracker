import { createPortal } from 'react-dom'
import { AnimatePresence } from 'motion/react'
import { ToastItem } from './Toast'
import type { Toast } from '../../types/toast'

interface ToastContainerProps {
  /** The current stack of active toasts. */
  toasts: Toast[]
  /** Callback to remove a specific toast by id. */
  removeToast: (id: string) => void
}

/**
 * Renders the toast stack into a dedicated portal element (`#toast-root`)
 * so notifications float above all other page content regardless of
 * stacking context.
 *
 * The container is fixed to the bottom-right corner of the viewport with
 * `pointer-events-none` on the wrapper so it doesn't block interaction
 * with content beneath — individual `ToastItem` elements re-enable
 * pointer events on themselves.
 *
 * `AnimatePresence` from `motion` handles exit animations — when a toast
 * is removed from the array it plays its `exit` transition before
 * unmounting, giving a smooth slide-out effect.
 *
 * The `aria-live="polite"` region ensures screen readers announce new
 * toasts without interrupting the user's current activity.
 */
export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const portalTarget = document.getElementById('toast-root')
  if (!portalTarget) return null

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>,
    portalTarget,
  )
}
