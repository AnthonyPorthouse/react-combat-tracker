import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

/**
 * The application landing page at `/`.
 *
 * Serves as an entry point and orientation for new users, combining a brief
 * product pitch with direct navigation links to the two main areas of the
 * app: the combat tracker and the creature library. A static "Combat Snapshot"
 * preview card gives first-time visitors a visual sense of the tracker UI
 * before they enter.
 */
function LandingPage() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-8 py-14 shadow-sm">
      <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -right-24 bottom-6 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Initiative, Sorted
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl font-['Space_Grotesk']">
            Run fast, focused encounters with your creatures in sync.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Track combat order, maintain your library, and keep your table moving with a
            streamlined flow.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/app"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Launch Combat Tracker
            </Link>
            <Link
              to="/library"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Manage Library
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Combat Snapshot
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ready
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {['Scouts', 'Veteran', 'Winged Terror'].map((name, index) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">{name}</p>
                  <p className="text-xs text-slate-500">Initiative {18 - index * 3}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  Turn {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
