import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface MenuPosition {
  top: number
  left: number
  transform: string
}

interface DropdownMenuProps {
  triggerLabel: string
  triggerContent: React.ReactNode
  triggerClassName?: string
  menuClassName?: string
  align?: 'left' | 'right'
  /** Render-prop that receives a `close` callback, used by menu items to close
   *  the menu after an action is triggered. */
  children: (close: () => void) => React.ReactNode
}

/**
 * A portal-based dropdown menu anchored to its trigger button.
 *
 * Renders the menu panel into `#menu-root` (a separate portal target from
 * `#modal-root`) so it always floats above all page content without fighting
 * z-index stacking contexts. The position is calculated from the trigger's
 * `getBoundingClientRect` at open-time, snapping to either the right or left
 * edge of the trigger depending on `align`.
 *
 * While the menu is open, `#root` and `#modal-root` are marked `inert` to
 * prevent keyboard focus from escaping behind the transparent overlay. A
 * full-screen invisible overlay captures outside clicks and Escape key events
 * to close the menu.
 *
 * The `children` render-prop pattern gives menu items access to the `close`
 * callback without needing a separate `onClose` prop threaded through each
 * item — items call `close()` immediately after triggering their action so
 * the menu dismisses in the same user gesture.
 */
export function DropdownMenu({
  triggerLabel,
  triggerContent,
  triggerClassName = '',
  menuClassName = 'w-40',
  align = 'right',
  children,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)
  const triggerId = useId()
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const rootElement = document.getElementById('root')
    const modalRootElement = document.getElementById('modal-root')
    if (!rootElement || !modalRootElement) return

    if (isOpen) {
      rootElement.inert = true
      modalRootElement.inert = true
    } else {
      rootElement.inert = false
      modalRootElement.inert = false
    }

    return () => {
      rootElement.inert = false
      modalRootElement.inert = false
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      // Move focus to the first menu item so keyboard users can navigate immediately
      const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')
      firstItem?.focus()
    } else {
      triggerRef.current?.focus()
    }
  }, [isOpen])

  const menuRoot = typeof document !== 'undefined' ? document.getElementById('menu-root') : null

  /** Closes the menu and releases its calculated position from state. */
  const closeMenu = () => {
    setIsOpen(false)
    setMenuPosition(null)
  }

  /**
   * Toggles the menu open/closed and calculates its position on open.
   *
   * Position is derived from the trigger's bounding rect at the moment of the
   * click so it stays anchored to the button even if the page has scrolled.
   * The 8px top offset creates breathing room between the trigger and panel.
   * `translateX(-100%)` for right-aligned menus shifts the panel left so its
   * right edge aligns with the trigger's right edge.
   */
  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isOpen) {
      closeMenu()
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const top = rect.bottom + 8
    const left = align === 'right' ? rect.right : rect.left
    const transform = align === 'right' ? 'translateX(-100%)' : 'none'

    setMenuPosition({ top, left, transform })
    setIsOpen(true)
  }

  /**
   * Closes the menu on Escape key, and supports Up/Down arrow navigation
   * between menu items per the ARIA menu keyboard interaction pattern.
   */
  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      closeMenu()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
      )
      if (items.length === 0) return
      const focused = document.activeElement
      const currentIndex = items.indexOf(focused as HTMLElement)
      const nextIndex =
        event.key === 'ArrowDown'
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length
      items[nextIndex]?.focus()
    }
  }

  return (
    <div className="inline-flex">
      <button
        type="button"
        onClick={handleTriggerClick}
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        id={triggerId}
        ref={triggerRef}
      >
        {triggerContent}
      </button>
      {isOpen && menuRoot && menuPosition
        ? createPortal(
            <div
              className="fixed inset-0 z-50 bg-transparent"
              onClick={closeMenu}
              onKeyDown={handleOverlayKeyDown}
              tabIndex={-1}
            >
              <div
                className={`absolute rounded-md border border-gray-200 bg-white shadow-lg ${menuClassName}`}
                style={{
                  top: menuPosition.top,
                  left: menuPosition.left,
                  transform: menuPosition.transform,
                }}
                role="menu"
                id={menuId}
                aria-labelledby={triggerId}
                ref={menuRef}
                onClick={(event) => event.stopPropagation()}
              >
                {children(closeMenu)}
              </div>
            </div>,
            menuRoot
          )
        : null}
    </div>
  )
}
