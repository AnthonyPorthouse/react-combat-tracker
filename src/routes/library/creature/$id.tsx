import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { CreatureForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Creature } from '../../../db/stores/creature'
import { useToast } from '../../../state/toastContext'

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
  const { t } = useTranslation('library')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { id } = Route.useParams()
  const categories = useLiveQuery(() => db.categories.toArray())
  const creature = useLiveQuery(() => db.creatures.get(id), [id])

  const handleSubmit = async (updated: Creature) => {
    await db.creatures.update(updated.id, updated)
    addToast(t('toast.creatureUpdated'))
    await navigate({ to: '/library' })
  }

  if (creature === undefined) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <title>{t('editingPageTitle')}</title>
        <p className="text-sm text-slate-500">{t('loadingCreatureDetails')}</p>
      </div>
    )
  }

  if (!creature) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <title>{t('creatureNotFoundPageTitle')}</title>
        <h2 className="text-xl font-semibold text-slate-900">{t('creatureNotFound')}</h2>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {t('common:backToLibrary')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <title>{t('editingEntityPageTitle', { name: creature.name })}</title>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{t('library')}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t('editCreature')}</h2>
        </div>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {t('common:backToLibrary')}
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
