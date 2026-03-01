import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { db } from '../../../db/db'
import { useToast } from '../../../state/toastContext'
import { useListWithSelection } from '../../../hooks/useListWithSelection'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { SelectableIcon } from '../../../components/common/SelectableIcon'
import { SelectionToolbar } from '../../../components/common/SelectionToolbar'
import { Edit, Trash2 } from 'lucide-react'

interface CreatureListProps {
  selectedCategoryId?: string
}

/**
 * Searchable, filterable list of all library creatures.
 *
 * Supports filtering by a parent `selectedCategoryId` prop (used by
 * `LibraryPanel` when a category is selected) as well as a local free-text
 * search. Both filters are applied in a `useMemo` to avoid redundant
 * iteration on every keystroke.
 *
 * `getCategoryNames` resolves category ids to display names for each
 * creature row. It is intentionally called in the render body rather than
 * memoized per-creature, as the list is expected to be small (library
 * creatures are user-curated) and the Dexie live query already handles
 * re-renders when data changes.
 */
export function CreatureList({ selectedCategoryId }: CreatureListProps) {
  const creatures = useLiveQuery(() => db.creatures.orderBy('name').toArray())
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray())
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useTranslation('library')
  const { t: tCommon } = useTranslation('common')
  const { addToast } = useToast()

  /**
   * Ref attached to the scrollable container used by the virtualizer to
   * determine which rows fall within the visible viewport.
   */
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCreatures = useMemo(() => {
    if (!creatures) return []

    return creatures.filter((creature) => {
      const matchesCategory =
        !selectedCategoryId || creature.categoryIds.includes(selectedCategoryId)
      const matchesSearch =
        creature.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [creatures, selectedCategoryId, searchTerm])

  /**
   * Virtualises the `filteredCreatures` list so only visible rows are mounted
   * in the DOM. `measureElement` is used instead of a fixed `estimateSize` to
   * correctly handle variable-height rows (creatures with/without category
   * labels). The virtualizer reads the rendered height of each row after mount
   * and recalculates offsets, so the scrollbar and total height stay accurate.
   *
   * `overscan: 5` pre-renders five extra rows above and below the viewport to
   * eliminate blank flashes during fast scrolling on low-end devices.
   */
  const rowVirtualizer = useVirtualizer({
    count: filteredCreatures.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 84,
    overscan: 5,
  })

  const visibleIds = useMemo(
    () => filteredCreatures.map((c) => c.id),
    [filteredCreatures],
  )

  const {
    toggle, isSelected, selectionState, selectionCount,
    handleToggleAll, bulkDeleteModal, handleBulkDelete,
    singleDeleteModal, openSingleConfirm, closeSingleConfirm, handleSingleDelete,
  } = useListWithSelection({
    items: visibleIds,
    bulkDeleteFn: async (ids) => {
      await db.creatures.bulkDelete(ids)
      addToast(t('toast.creaturesDeleted', { count: ids.length }))
    },
    singleDeleteFn: async (id) => {
      await db.creatures.delete(id)
      addToast(t('toast.creatureDeleted'))
    },
  })

  /**
   * Resolves category ids to a comma-separated list of names for display.
   *
   * Returns an empty string when `categories` is still loading (undefined)
   * so the UI gracefully shows nothing rather than crashing on `.filter()`.
   */
  const getCategoryNames = (categoryIds: string[]) => {
    if (!categories) return ''
    return categories
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.name)
      .join(', ')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{t('creatures')}</h3>
      </div>

      {creatures?.length !== 0 && <input
        type="text"
        id="creature-list-search"
        name="creature-list-search"
        aria-label={tCommon('searchCreatures')}
        placeholder={tCommon('searchCreatures')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
      />}

      {!creatures || filteredCreatures.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {creatures?.length === 0
            ? t('noCreaturesYet')
            : t('noCreaturesMatch')}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <SelectionToolbar
            selectionState={selectionState}
            selectionCount={selectionCount}
            onToggleAll={handleToggleAll}
            onBulkDelete={bulkDeleteModal.open}
          />
          {/*
           * Virtual scroll container. Only rows within (or near) the visible
           * area are rendered. The inner div is sized to the full list height
           * so the scrollbar remains proportional; each row is positioned
           * absolutely via a translateY transform.
           */}
          <div
            ref={listRef}
            className="overflow-y-auto max-h-[66vh]"
          >
            <div
              style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const creature = filteredCreatures[virtualItem.index]
                // Compute once to avoid the previous double-call pattern
                // (one call for the truthiness guard, a second for the value).
                const categoryNames = getCategoryNames(creature.categoryIds)
                return (
                  <div
                    key={virtualItem.key}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualItem.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: '8px',
                    }}
                  >
                    <div className="p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-start gap-2">
                          <div className="pt-0.5">
                            <SelectableIcon
                              state={isSelected(creature.id) ? 'checked' : 'unchecked'}
                              onClick={() => toggle(creature.id)}
                              ariaLabel={creature.name}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{creature.name}</h4>
                            <p className="text-xs text-gray-500">
                              {t('initiativeSummary', { initiative: creature.initiative, type: creature.initiativeType === 'fixed' ? tCommon('fixed') : tCommon('roll') })}
                            </p>
                            {categoryNames && (
                              <p className="text-xs text-gray-600 mt-1">{categoryNames}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to="/library/creature/$id"
                            params={{ id: creature.id }}
                            className="text-blue-600 hover:text-blue-700 p-1 transition"
                            aria-label={t('edit', { entity: t('creature') })}
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => openSingleConfirm(creature.id)}
                            className="text-red-600 hover:text-red-700 p-1 transition"
                            aria-label={t('delete', { entity: t('creature') })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={bulkDeleteModal.isOpen}
        onClose={bulkDeleteModal.close}
        title={t('bulkDeleteCreatures.title', { count: selectionCount })}
        message={t('bulkDeleteCreatures.message', { count: selectionCount })}
        icon={<Trash2 size={36} />}
        actionLabel={t('deleteSelected', { count: selectionCount })}
        actionVariant="danger"
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        isOpen={singleDeleteModal.isOpen}
        onClose={closeSingleConfirm}
        title={t('deleteCreature.title')}
        message={t('deleteCreature.message')}
        icon={<Trash2 size={36} />}
        actionLabel={t('deleteCreature.confirm')}
        actionVariant="danger"
        onConfirm={handleSingleDelete}
      />
    </div>
  )
}
