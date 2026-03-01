import { useId, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReactNode, SubmitEventHandler } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { fadeVariants, scaleVariants, transitions } from '../../utils/motion'
import { useFocusTrap } from '../../hooks'

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  actions?: ReactNode
  isClosable?: boolean
  className?: string
  onSubmit?: SubmitEventHandler<HTMLFormElement>
  /**
   * Ref to the element that triggered the modal to open.
   * Keyboard focus is returned here when the modal closes, satisfying
   * WCAG 2.1 SC 2.4.3 (Focus Order). Pass `useRef(null)` when there is no
   * obvious trigger element (e.g. a modal opened from within a dropdown).
   */
  triggerRef: RefObject<HTMLElement | null>
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
  triggerRef,
}: BaseModalProps) {
  const { t } = useTranslation('common')
  const titleId = useId()
  useFocusTrap(isOpen, triggerRef)

  const panelClassName = [
    'bg-white rounded-lg shadow-xl max-w-2xl overflow-y-auto m-4 md:m-0',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  /**
   * Closes the modal when the user clicks the dimmed backdrop area.
   *
   * Guarded by `isClosable` so callers can prevent accidental dismissal
   * during sensitive operations (e.g. a long-running import). The panel's
   * click handler calls `stopPropagation` so clicks inside don't bubble up
   * and trigger this.
   */
  const handleBackdropClick = () => {
    if (isClosable) {
      onClose()
    }
  }

  const content = (
    <>
      <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 id={titleId} className="text-lg font-bold text-gray-900">{title}</h2>
        {isClosable && (
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label={t('closeModal')}
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitions.backdrop}
          onClick={handleBackdropClick}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={panelClassName}
            variants={scaleVariants}
            transition={transitions.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root')!
  )
}
