import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { db } from '../../../db/db'
import { Edit, Trash2 } from 'lucide-react'

/**
 * Displays all library categories with edit and delete actions.
 *
 * Uses a `useLiveQuery` subscription so the list updates in real time if
 * another tab adds or removes a category (or if the library import flow
 * writes categories in bulk).
 *
 * Category deletion cascades to remove the deleted category id from the
 * `categoryIds` array of every creature that references it, using Dexie's
 * multi-entry index (`*categoryIds`) to find the affected records efficiently
 * without a full table scan.
 */
export function CategoryList() {
  const categories = useLiveQuery(() => db.categories.toArray())
  const { t } = useTranslation('library')

  /**
   * Deletes a category and removes it from every creature that references it.
   *
   * Deletion is performed as two sequential operations (not a transaction)
   * because IndexedDB does not support cascades natively. The category record
   * is deleted first; then each creature with that id in its `categoryIds`
   * array is updated to filter it out. If the second step fails, the category
   * will be gone but orphaned references may linger — a future improvement
   * would wrap both in a `db.transaction('rw', ...)` call.
   *
   * The native `confirm()` prompt is intentional for simplicity — replacing
   * it with a proper `ConfirmDialog` modal is a natural future improvement.
   */
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
        <h3 className="text-lg font-semibold text-gray-900">{t('categories')}</h3>
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-gray-500 text-sm">{t('noCategoriesYet')}</p>
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
                  aria-label={t('editCategory')}
                >
                  <Edit size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700 p-1 transition"
                  aria-label={t('deleteCategory')}
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
