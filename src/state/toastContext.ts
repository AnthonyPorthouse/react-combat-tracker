import { createContext, useContext } from 'react'

interface ToastContextValue {
  /** Enqueues a new success toast with the given message. */
  addToast: (message: string) => void
}

/**
 * Context that carries the toast API down the component tree so any
 * component can trigger a success notification without prop-drilling.
 *
 * Initialised to `null` so `useToast` can detect when a consumer is
 * rendered outside a `ToastProvider`.
 */
export const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Retrieves the toast API from context.
 *
 * Throws immediately when called outside a `ToastProvider` subtree,
 * surfacing the misconfiguration as a loud, early failure.
 *
 * @throws {Error} When not rendered inside a `ToastProvider`.
 * @returns The `addToast` function for showing success notifications.
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
