import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CategoryForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Category } from '../../../db/stores/categories'
import { useToast } from '../../../state/toastContext'

export const Route = createFileRoute('/library/category/new')({
  component: CreateCategoryPage,
})

/**
 * Full-page category creation form at `/library/category/new`.
 *
 * A dedicated route for creating categories during library preparation. On
 * success, redirects to `/library` where the new category will be visible
 * in the list immediately via the live query.
 */
function CreateCategoryPage() {
  const { t } = useTranslation('library')
  const navigate = useNavigate()
  const { addToast } = useToast()

  const handleSubmit = async (category: Category) => {
    await db.categories.add(category)
    addToast(t('toast.categoryCreated'))
    await navigate({ to: '/library' })
  }

  return (
    <div className="space-y-6">
      <title>{t('newCategoryPageTitle')}</title>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{t('library')}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t('create', { entity: t('category') })}</h2>
        </div>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {t('common:backToLibrary')}
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/library' })}
        />
      </div>
    </div>
  )
}
