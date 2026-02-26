import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional custom UI to render in place of the crashed subtree. */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Catches runtime errors thrown during the render phase of any child component
 * and displays a recovery UI rather than crashing the entire page.
 *
 * React requires error boundaries to be class components — the lifecycle
 * methods `getDerivedStateFromError` and `componentDidCatch` have no
 * functional-component equivalent.
 *
 * The "Try again" button resets `hasError` to `false`, which causes React to
 * re-render the children. This is appropriate for transient errors like
 * a failed Dexie live query caused by a momentary IndexedDB lock — the
 * second render attempt will usually succeed.
 *
 * If a custom `fallback` is provided (e.g. for a specific route), it is
 * rendered instead of the built-in error card.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Derives the error state from a thrown error during rendering.
   *
   * Called by React synchronously during the render phase, before
   * `componentDidCatch`, so the UI can switch to the fallback on the same
   * render pass rather than flashing broken content first.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * Side-effect hook called after an error has been caught and the fallback
   * UI is already committed to the DOM.
   *
   * The `info.componentStack` is logged alongside the error to make it easier
   * to trace which component in the tree threw. In a production setup this
   * would be the right place to forward errors to a monitoring service.
   */
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-6">
          <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-500 max-w-md">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
