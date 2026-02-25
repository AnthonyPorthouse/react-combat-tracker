import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { CategoryForm } from '../../../features/library'
import { db } from '../../../db/db'
import type { Category } from '../../../db/stores/categories'

export const Route = createFileRoute('/library/category/new')({
  component: CreateCategoryPage,
})

function CreateCategoryPage() {
  const navigate = useNavigate()

  const handleSubmit = async (category: Category) => {
    await db.categories.add(category)
    await navigate({ to: '/library' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Library</p>
          <h2 className="text-2xl font-semibold text-slate-900">Create Category</h2>
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
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/library' })}
        />
      </div>
    </div>
  )
}
