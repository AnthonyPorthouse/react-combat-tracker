import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { CombatProvider } from '../state/combat.tsx'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <CombatProvider>
          <Outlet />
        </CombatProvider>
      </main>

    </div>
  )
}
