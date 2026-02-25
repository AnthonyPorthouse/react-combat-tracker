import { useEffect, useRef, useState } from 'react'
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
  children: (close: () => void) => React.ReactNode
}

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
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

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
      overlayRef.current?.focus()
    }
  }, [isOpen])

  const menuRoot = typeof document !== 'undefined' ? document.getElementById('menu-root') : null

  const closeMenu = () => {
    setIsOpen(false)
    setMenuPosition(null)
  }

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

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      closeMenu()
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
              ref={overlayRef}
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
