import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from '@tanstack/react-router'
import { db } from '../../../db/db'
import { Edit, Trash2 } from 'lucide-react'

export function CategoryList() {
  const categories = useLiveQuery(() => db.categories.toArray())

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await db.categories.delete(id)
      const creaturesWithCategory = await db.creatures
        .where('categoryIds')
        .equals(id)
        .toArray()

      for (const creature of creaturesWithCategory) {
        await db.creatures.update(creature.id, {
          categoryIds: creature.categoryIds.filter((cid) => cid !== id),
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-gray-500 text-sm">No categories yet. Create one to organize creatures.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              <span className="text-gray-900">{category.name}</span>
              <div className="flex gap-2">
                <Link
                  to="/library/category/$id"
                  params={{ id: category.id }}
                  className="text-blue-600 hover:text-blue-700 p-1 transition"
                  aria-label="Edit category"
                >
                  <Edit size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700 p-1 transition"
                  aria-label="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
