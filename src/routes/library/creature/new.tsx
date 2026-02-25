import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { CreatureForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Creature } from '../../../db/stores/creature'

export const Route = createFileRoute('/library/creature/new')({
  component: CreateCreaturePage,
})

function CreateCreaturePage() {
  const navigate = useNavigate()
  const categories = useLiveQuery(() => db.categories.toArray())

  const handleSubmit = async (creature: Creature) => {
    await db.creatures.add(creature)
    await navigate({ to: '/library' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Library</p>
          <h2 className="text-2xl font-semibold text-slate-900">Create Creature</h2>
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
          categories={categories || []}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/library' })}
        />
      </div>
    </div>
  )
}
