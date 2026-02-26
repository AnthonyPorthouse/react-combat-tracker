import { useEffect } from 'react'
import type { ReactNode, SubmitEventHandler } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  actions?: ReactNode
  isClosable?: boolean
  className?: string
  onSubmit?: SubmitEventHandler<HTMLFormElement>
}

/**
 * The foundational modal dialog component for the application.
 *
 * Renders into the `#modal-root` portal to ensure modals sit above all page
 * content regardless of where they are mounted in the React tree, avoiding
 * z-index conflicts with positioned ancestors.
 *
 * The `#root` element is marked `inert` while the modal is open to:
 * 1. Trap keyboard focus inside the modal (screen-reader safety).
 * 2. Prevent the page behind the backdrop from being accidentally interacted
 *    with on touch devices.
 *
 * When `onSubmit` is provided, the body is wrapped in a `<form>` element so
 * native browser form validation (required fields, number ranges, etc.) runs
 * before the submit handler, and pressing Enter in a text input submits
 * correctly without extra event wiring.
 *
 * @param isClosable - When `false`, hides the × button and ignores backdrop
 *   clicks. Use this for operations that must not be interrupted mid-flight
 *   (e.g. during an import in progress).
 */
export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  isClosable = true,
  className,
  onSubmit,
}: BaseModalProps) {
  useEffect(() => {
    const rootElement = document.getElementById('root')
    if (!rootElement) return

    if (isOpen) {
      rootElement.inert = true
    } else {
      rootElement.inert = false
    }

    return () => {
      rootElement.inert = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const panelClassName = [
    'static bg-white rounded-lg shadow-xl max-w-2xl overflow-y-auto m-4 md:m-0',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  /**
   * Closes the modal when the user clicks the dimmed backdrop area.
   *
   * Guarded by `isClosable` so callers can prevent accidental dismissal
   * during sensitive operations (e.g. a long-running import). The dialog
   * element's own click handler calls `stopPropagation` so clicks inside
   * the panel don't bubble up and trigger this.
   */
  const handleBackdropClick = () => {
    if (isClosable) {
      onClose()
    }
  }

  const content = (
    <>
      <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {isClosable && (
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {onSubmit ? (
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          {actions}
        </form>
      ) : (
        <div className="p-6 space-y-4">
          {children}
          {actions}
        </div>
      )}
    </>
  )

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <dialog open={isOpen} aria-modal="true"  className={panelClassName} onClick={(e) => e.stopPropagation()}>
        {content}
      </dialog>
    </div>,
    document.getElementById('modal-root')!
  )
}
