import { useCallback, useState, type PropsWithChildren } from 'react'
import { nanoid } from 'nanoid'
import { ToastContext } from './toastContext'
import type { Toast } from '../types/toast'

/**
 * Owns the global toast notification state and provides `addToast` to the
 * entire subtree via context.
 *
 * State is managed with plain `useState` rather than a reducer because the
 * operations are trivial — append on add, filter on remove. Keeps the
 * implementation lightweight for what is purely ephemeral UI state.
 *
 * Place this high in the tree (e.g. in `__root.tsx`) so toasts are
 * available across all routes including library pages that live outside
 * the `CombatProvider`.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])

  /** Appends a new toast to the stack. */
  const addToast = useCallback((message: string) => {
    const toast: Toast = {
      id: nanoid(),
      message,
      createdAt: Date.now(),
    }
    setToasts((prev) => [...prev, toast])
  }, [])

  /** Removes a toast by id once its timer expires or the user dismisses it. */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Lazy import avoided — the container is always needed when toasts exist.
import { ToastContainer } from '../components/common/ToastContainer'
