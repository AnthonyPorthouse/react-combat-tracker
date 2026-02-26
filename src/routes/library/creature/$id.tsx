import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { CreatureForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Creature } from '../../../db/stores/creature'

export const Route = createFileRoute('/library/creature/$id')({
  component: EditCreaturePage,
})

/**
 * Full-page creature edit form at `/library/creature/:id`.
 *
 * Fetches the creature by id from IndexedDB via a live query. Three
 * render states are handled explicitly:
 * - `undefined` — query is still loading; shows a skeleton message.
 * - `null/falsy` — id not found in the database; shows "not found" with a
 *   back link so the user isn't stranded.
 * - Loaded — renders the pre-populated `CreatureForm` for editing.
 *
 * On submit, `db.creatures.update` merges the changes and navigates back
 * to `/library`.
 */
function EditCreaturePage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const categories = useLiveQuery(() => db.categories.toArray())
  const creature = useLiveQuery(() => db.creatures.get(id), [id])

  const handleSubmit = async (updated: Creature) => {
    await db.creatures.update(updated.id, updated)
    await navigate({ to: '/library' })
  }

  if (creature === undefined) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <title>Combat Tracker | Editing Creature</title>
        <p className="text-sm text-slate-500">Loading creature details...</p>
      </div>
    )
  }

  if (!creature) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <title>Combat Tracker | Creature Not Found</title>
        <h2 className="text-xl font-semibold text-slate-900">Creature not found</h2>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <title>Combat Tracker | Editing {creature.name}</title>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Library</p>
          <h2 className="text-2xl font-semibold text-slate-900">Edit Creature</h2>
        </div>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Back to Library
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CreatureForm
          creature={creature}
          categories={categories || []}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/library' })}
        />
      </div>
    </div>
  )
}
