import { useMemo, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { db } from '../../../db/db'
import { shouldAnimate } from '../../../utils/motion'
import { useToast } from '../../../state/toastContext'
import { useListWithSelection } from '../../../hooks/useListWithSelection'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { SelectableIcon } from '../../../components/common/SelectableIcon'
import { SelectionToolbar } from '../../../components/common/SelectionToolbar'
import { AnimatableList, AnimatableItem } from '../../../components/common/AnimatableList'
import { Edit, Trash2 } from 'lucide-react'

/**
 * Renders the full category list with per-row and bulk delete support.
 *
 * Single-item deletes use a `ConfirmDialog` (not the native browser
 * `confirm()`) for consistency with the rest of the design system.
 *
 * Category deletion cascades: the deleted category id is removed from the
 * `categoryIds` array of every creature that references it, using Dexie's
 * multi-entry index (`*categoryIds`) for an efficient targeted query rather
 * than a full table scan.
 */
export function CategoryList() {
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray())
  const { t } = useTranslation('library')
  const { addToast } = useToast()

  /**
   * Tracks the delete button that last opened the single-item confirm dialog,
   * so focus can be restored when that dialog closes.
   */
  const singleDeleteTriggerRef = useRef<HTMLElement | null>(null)
  /**
   * Bulk delete uses a null ref — items being deleted means the toolbar button
   * may no longer exist when the dialog closes, so focus restoration is skipped.
   */
  const bulkDeleteTriggerRef = useRef<HTMLElement | null>(null)

  const visibleIds = useMemo(
    () => (categories ?? []).map((c) => c.id),
    [categories],
  )

  const {
    toggle, isSelected, selectionState, selectionCount,
    handleToggleAll, bulkDeleteModal, handleBulkDelete,
    singleDeleteModal, openSingleConfirm, closeSingleConfirm, handleSingleDelete,
  } = useListWithSelection({
    items: visibleIds,
    bulkDeleteFn: async (ids) => {
      const idSet = new Set(ids)
      await db.transaction('rw', [db.categories, db.creatures], async () => {
        const affected = await db.creatures.where('categoryIds').anyOf(ids).toArray()
        const updates = affected.map((creature) => ({
          ...creature,
          categoryIds: creature.categoryIds.filter((cid) => !idSet.has(cid)),
        }))
        await db.creatures.bulkPut(updates)
        await db.categories.bulkDelete(ids)
      })
      addToast(t('toast.categoriesDeleted', { count: ids.length }))
    },
    singleDeleteFn: async (id) => {
      await db.transaction('rw', [db.categories, db.creatures], async () => {
        await db.categories.delete(id)
        const affected = await db.creatures.where('categoryIds').equals(id).toArray()
        const updates = affected.map((creature) => ({
          ...creature,
          categoryIds: creature.categoryIds.filter((cid) => cid !== id),
        }))
        await db.creatures.bulkPut(updates)
      })
      addToast(t('toast.categoryDeleted'))
    },
  })

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
          <AnimatableList animate={animateItems}>
            {categories.map((category) => (
              <AnimatableItem
                key={category.id}
                animate={animateItems}
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
                    onClick={(e) => { singleDeleteTriggerRef.current = e.currentTarget; openSingleConfirm(category.id) }}
                    className="text-red-600 hover:text-red-700 p-1 transition"
                    aria-label={t('delete', { entity: t('category') })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </AnimatableItem>
            ))}
          </AnimatableList>
        </div>
      )}

      <ConfirmDialog
        isOpen={bulkDeleteModal.isOpen}
        onClose={bulkDeleteModal.close}
        triggerRef={bulkDeleteTriggerRef}
        title={t('bulkDeleteCategories.title', { count: selectionCount })}
        message={t('bulkDeleteCategories.message', { count: selectionCount })}
        icon={<Trash2 size={36} />}
        actionLabel={t('deleteSelected', { count: selectionCount })}
        actionVariant="danger"
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        isOpen={singleDeleteModal.isOpen}
        onClose={closeSingleConfirm}
        triggerRef={singleDeleteTriggerRef}
        title={t('deleteCategory.title')}
        message={t('deleteCategory.message')}
        icon={<Trash2 size={36} />}
        actionLabel={t('deleteCategory.confirm')}
        actionVariant="danger"
        onConfirm={handleSingleDelete}
      />
    </div>
  )
}
