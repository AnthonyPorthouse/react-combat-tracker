import { Link, createFileRoute } from '@tanstack/react-router'
import { LibraryPanel } from '../../features/library'

export const Route = createFileRoute('/library/')({
  component: LibraryPage,
})

function LibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Creature Library</h2>
          <p className="text-sm text-slate-500">
            Manage creatures and categories. Add them to combat from the combat view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/library/creature/new"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            New Creature
          </Link>
          <Link
            to="/library/category/new"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            New Category
          </Link>
        </div>
      </div>

      <LibraryPanel />
    </div>
  )
}
