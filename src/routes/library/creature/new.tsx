import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { CreatureForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Creature } from '../../../db/stores/creature'
import { useToast } from '../../../state/toastContext'

export const Route = createFileRoute('/library/creature/new')({
  component: CreateCreaturePage,
})

/**
 * Full-page creature creation form at `/library/creature/new`.
 *
 * Mirrors the inline `CreatureForm` available inside `LibraryModal`, but as
 * a dedicated route. Navigating here is appropriate when the DM wants to
 * create a creature outside of an active combat session (e.g. during
 * preparation). On success, redirects back to `/library` so the new creature
 * appears in the list immediately.
 */
function CreateCreaturePage() {
  const { t } = useTranslation('library')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const categories = useLiveQuery(() => db.categories.toArray())

  const handleSubmit = async (creature: Creature) => {
    await db.creatures.add(creature)
    addToast(t('toast.creatureCreated'))
    await navigate({ to: '/library' })
  }

  return (
    <div className="space-y-6">
      <title>{t('newCreaturePageTitle')}</title>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{t('library')}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t('create', { entity: t('creature') })}</h2>
        </div>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {tCommon('backToLibrary')}
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
