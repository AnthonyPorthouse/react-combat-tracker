import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { CategoryForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Category } from '../../../db/stores/categories'

export const Route = createFileRoute('/library/category/$id')({
  component: EditCategoryPage,
})

/**
 * Full-page category edit form at `/library/category/:id`.
 *
 * Handles the same three loading states as `EditCreaturePage` (loading,
 * not found, loaded). On submit, `db.categories.update` persists the
 * updated name and navigates back to `/library`.
 *
 * Note: changing a category name here does not require any update to the
 * creatures that reference this category — creatures store only the id.
 * The UI resolves names at render time, so a name change is immediately
 * reflected everywhere without any cascade update.
 */
function EditCategoryPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const category = useLiveQuery(() => db.categories.get(id), [id])

  const handleSubmit = async (updated: Category) => {
    await db.categories.update(updated.id, updated)
    await navigate({ to: '/library' })
  }

  if (category === undefined) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <title>Combat Tracker | Editing Category</title>
        <p className="text-sm text-slate-500">Loading category details...</p>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <title>Combat Tracker | Category Not Found</title>
        <h2 className="text-xl font-semibold text-slate-900">Category not found</h2>
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
      <title>Combat Tracker | Editing {category.name}</title>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Library</p>
          <h2 className="text-2xl font-semibold text-slate-900">Edit Category</h2>
        </div>
        <Link
          to="/library"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Back to Library
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CategoryForm
          category={category}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/library' })}
        />
      </div>
    </div>
  )
}
