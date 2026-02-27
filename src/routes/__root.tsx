import { createRootRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { CombatProvider } from '../state/combat.tsx'
import { ToastProvider } from '../state/toast.tsx'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * The application shell rendered for every route.
 *
 * Provides the persistent navigation header (Home / Combat / Library) and
 * wraps the route `<Outlet>` in a `CombatProvider` so that all routes share
 * the same combat session state — navigating from `/app` to `/library` and
 * back does not reset the encounter in progress.
 *
 * The `ErrorBoundary` around `<Outlet>` ensures that a runtime error in any
 * route (e.g. a failed IndexedDB query) shows a recovery UI rather than
 * crashing the entire shell including the navigation header.
 *
 * The navigation header is suppressed on the `/players` route so the
 * GM-facing popout displays a clean, minimal view suitable for showing on
 * a secondary screen without the app chrome.
 */
function RootLayout() {
  const { pathname } = useLocation()
  const isPlayerView = pathname === '/players'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!isPlayerView && (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Combat Tracker
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link
                to="/"
                className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
                activeProps={{
                  className: 'rounded-full px-3 py-1.5 bg-slate-900 text-white',
                }}
              >
                Home
              </Link>
              <Link
                to="/app"
                className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
                activeProps={{
                  className: 'rounded-full px-3 py-1.5 bg-slate-900 text-white',
                }}
              >
                Combat
              </Link>
              <Link
                to="/library"
                className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
                activeProps={{
                  className: 'rounded-full px-3 py-1.5 bg-slate-900 text-white',
                }}
              >
                Library
              </Link>
            </nav>
          </div>
        </header>
      )}

      <main className={isPlayerView ? 'w-full' : 'mx-auto w-full max-w-6xl px-6 py-8'}>
        <ToastProvider>
          <CombatProvider>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </CombatProvider>
        </ToastProvider>
      </main>

    </div>
  )
}
