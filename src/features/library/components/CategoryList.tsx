import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { db } from '../../../db/db'
import { slideUpVariants, transitions, shouldAnimate } from '../../../utils/motion'
import { useToast } from '../../../state/toastContext'
import { useModal } from '../../../hooks/useModal'
import { useSelection } from '../../../hooks/useSelection'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { SelectableIcon } from '../../../components/common/SelectableIcon'
import { SelectionToolbar } from '../../../components/common/SelectionToolbar'
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
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray())
  const { t } = useTranslation('library')
  const { addToast } = useToast()
  const bulkDeleteModal = useModal()

  const visibleIds = useMemo(
    () => (categories ?? []).map((c) => c.id),
    [categories],
  )

  const {
    toggle,
    selectAll,
    deselectAll,
    isSelected,
    selectionState,
    count: selectionCount,
    selectedIds,
  } = useSelection(visibleIds)

  /**
   * Deletes a category and atomically removes it from every creature that
   * references it.
   *
   * Both writes run inside a single `db.transaction('rw', ...)` so they are
   * atomic — either both succeed or neither does, preventing orphaned
   * `categoryId` references if one step fails. `bulkPut` replaces the previous
   * N+1 sequential `update` calls, reducing IndexedDB round-trips from O(N)
   * to a single batch write.
   *
   * The `*categoryIds` multi-entry index is used to find affected creatures
   * without a full table scan.
   */
  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await db.transaction('rw', [db.categories, db.creatures], async () => {
        await db.categories.delete(id)
        const creaturesWithCategory = await db.creatures
          .where('categoryIds')
          .equals(id)
          .toArray()

        const updates = creaturesWithCategory.map((creature) => ({
          ...creature,
          categoryIds: creature.categoryIds.filter((cid) => cid !== id),
        }))
        await db.creatures.bulkPut(updates)
      })
      addToast(t('toast.categoryDeleted'))
    }
  }

  /**
   * Atomically deletes all selected categories and removes their references
   * from every creature that references any of them.
   *
   * Compared to the previous O(C × N) nested-loop approach:
   * - A single `anyOf` query leverages the multi-entry index to find ALL
   *   affected creatures across ALL selected category ids in one pass.
   * - `bulkPut` writes all mutated creatures in a single batch rather than
   *   N sequential `update` calls.
   * - The entire operation is wrapped in a transaction so it is atomic.
   */
  const handleBulkDelete = async () => {
    const ids = [...selectedIds]

    await db.transaction('rw', [db.categories, db.creatures], async () => {
      const idSet = new Set(ids)
      const affected = await db.creatures
        .where('categoryIds')
        .anyOf(ids)
        .toArray()

      const updates = affected.map((creature) => ({
        ...creature,
        categoryIds: creature.categoryIds.filter((cid) => !idSet.has(cid)),
      }))
      await db.creatures.bulkPut(updates)
      await db.categories.bulkDelete(ids)
    })

    deselectAll()
    bulkDeleteModal.close()
    addToast(t('toast.categoriesDeleted', { count: ids.length }))
  }

  /** Toggles the header checkbox between select-all and deselect-all. */
  const handleToggleAll = () => {
    if (selectionState === 'all') {
      deselectAll()
    } else {
      selectAll()
    }
  }

  /**
   * Whether per-item animations should run for this list.
   * Suppressed above `ANIMATION_THRESHOLD` so that large category sets do not
   * stall the main thread with simultaneous Framer Motion layout calculations.
   */
  const animateItems = shouldAnimate(categories?.length ?? 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{t('categoriesLegend')}</h3>
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-gray-500 text-sm">{t('noCategoriesYet')}</p>
      ) : (
        <div className="space-y-2 flex flex-col overflow-y-auto">
          <SelectionToolbar
            selectionState={selectionState}
            selectionCount={selectionCount}
            onToggleAll={handleToggleAll}
            onBulkDelete={bulkDeleteModal.open}
          />
          {animateItems ? (
            <AnimatePresence initial={false}>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={slideUpVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitions.item}
                className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition mb-2"
              >
                <div className="flex items-center gap-2">
                  <SelectableIcon
                    state={isSelected(category.id) ? 'checked' : 'unchecked'}
                    onClick={() => toggle(category.id)}
                    ariaLabel={category.name}
                  />
                  <span className="text-gray-900">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/library/category/$id"
                    params={{ id: category.id }}
                    className="text-blue-600 hover:text-blue-700 p-1 transition"
                    aria-label={t('edit', { entity: t('category') })}
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700 p-1 transition"
                    aria-label={t('delete', { entity: t('category') })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          ) : (
            <>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition mb-2"
              >
                <div className="flex items-center gap-2">
                  <SelectableIcon
                    state={isSelected(category.id) ? 'checked' : 'unchecked'}
                    onClick={() => toggle(category.id)}
                    ariaLabel={category.name}
                  />
                  <span className="text-gray-900">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/library/category/$id"
                    params={{ id: category.id }}
                    className="text-blue-600 hover:text-blue-700 p-1 transition"
                    aria-label={t('edit', { entity: t('category') })}
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700 p-1 transition"
                    aria-label={t('delete', { entity: t('category') })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={bulkDeleteModal.isOpen}
        onClose={bulkDeleteModal.close}
        title={t('bulkDeleteCategories.title', { count: selectionCount })}
        message={t('bulkDeleteCategories.message', { count: selectionCount })}
        icon={<Trash2 size={36} />}
        actionLabel={t('deleteSelected', { count: selectionCount })}
        actionVariant="danger"
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
