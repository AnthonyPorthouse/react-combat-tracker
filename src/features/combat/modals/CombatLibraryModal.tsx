import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Plus } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { db } from '../../../db/db'
import type { Combatant } from '../../../types/combatant'
import { useCreatureFilter } from '../../library/hooks/useCreatureFilter'
import { useConfirmAddFlow } from '../../library/hooks/useConfirmAddFlow'
import { CreatureFilterPanel } from '../../library/components/CreatureFilterPanel'
import { ConfirmAddCreaturesModal } from '../../library/modals/ConfirmAddCreaturesModal'

interface CombatLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCombatants: (combatants: Combatant[]) => void
}

/**
 * A searchable, filterable browser for adding library creatures to combat.
 *
 * Presented as an alternative to manually creating each combatant — the DM
 * selects creatures they've prepared in the library and then specifies how
 * many of each to spawn. This two-step flow (browse → confirm quantities)
 * is split across two modals: this one handles selection, and
 * `ConfirmAddCreaturesModal` handles quantity adjustment.
 *
 * The two modals are mutually exclusive: when the confirm modal opens, this
 * modal hides (via `showLibraryModal = isOpen && !isConfirmOpen`) rather than
 * stacking, to avoid nested modal z-index issues and cognitive overload.
 *
 * `useLiveQuery` subscriptions ensure the creature and category lists stay
 * current if the user edits the library in another tab between sessions.
 */
export function CombatLibraryModal({
  isOpen,
  onClose,
  onAddCombatants,
}: CombatLibraryModalProps) {
  // TanStack Virtual's useVirtualizer returns functions that the React
  // Compiler cannot safely memoize. We opt this component out of automatic
  // memoization so the compiler does not attempt transformations that would
  // break the virtualizer's internal update model.
  'use no memo'
  const creatures = useLiveQuery(() => db.creatures.orderBy('name').toArray())
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray())
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<Set<string>>(
    new Set(),
  )
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

  const {
    nameFilter,
    setNameFilter,
    selectedCategoryIds,
    filteredCreatures,
    toggleCategory,
  } = useCreatureFilter(creatures)

  const {
    isConfirmOpen,
    confirmCreatures,
    handleOpenConfirm,
    handleConfirmAdd,
    handleCancelConfirm,
    resetConfirm,
  } = useConfirmAddFlow({
    onAddCombatants,
    onClose,
    onResetSelection: () => setSelectedCreatureIds(new Set()),
  })

  /**
   * Ref for the creature list scroll container. TanStack Virtual uses this to
   * calculate which rows are within the visible area.
   */
  const creatureListRef = useRef<HTMLDivElement>(null)

  /**
   * Virtualises the filtered creature list. Each row contains a checkbox,
   * creature name, and initiative type — approximately 52px. `measureElement`
   * allows the virtualizer to self-correct if actual heights differ.
   */
  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer returns functions that the React Compiler cannot memoize; the compiler already skips this component, this comment makes the opt-out explicit.
  const creatureVirtualizer = useVirtualizer({
    count: filteredCreatures.length,
    getScrollElement: () => creatureListRef.current,
    estimateSize: () => 52,
    overscan: 5,
  })

  /** Closes both this modal and any open confirm modal, resetting all local state. */
  const handleCloseModal = () => {
    resetConfirm()
    onClose()
  }

  /** Toggles a creature's presence in the selection set. Uses Set for O(1) membership checks. */
  const toggleCreature = (creatureId: string) => {
    setSelectedCreatureIds((prev) => {
      const next = new Set(prev)
      if (next.has(creatureId)) next.delete(creatureId)
      else next.add(creatureId)
      return next
    })
  }

  const hasSelectedCreatures = selectedCreatureIds.size > 0
  const showLibraryModal = isOpen && !isConfirmOpen

  return (
    <>
      <BaseModal
        isOpen={showLibraryModal}
        onClose={handleCloseModal}
        title={tCommon('creatureLibraryTitle')}
        className="max-w-5xl"
        actions={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              {tCommon('close')}
            </button>
            <button
              type="button"
              onClick={() => handleOpenConfirm(creatures, selectedCreatureIds)}
              disabled={!hasSelectedCreatures}
              className={`px-4 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                hasSelectedCreatures
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus size={18} />
              {tCommon('addToCombat')}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreatureFilterPanel
            nameFilter={nameFilter}
            onNameFilterChange={setNameFilter}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={toggleCategory}
            categories={categories}
            noCategoriesMessage={t('noCategoriesYet')}
            nameInputId="combat-creature-name-filter"
            checkboxIdPrefix="combat-cat"
          />

          <div className="md:col-span-2">
            {!creatures || filteredCreatures.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                {creatures?.length === 0
                  ? tCommon('noCreaturesInLibrary')
                  : tCommon('noCreaturesMatchFilter')}
              </div>
            ) : (
              <div
                ref={creatureListRef}
                className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white"
              >
                <div
                  style={{ height: `${creatureVirtualizer.getTotalSize()}px`, position: 'relative' }}
                >
                  {creatureVirtualizer.getVirtualItems().map((virtualItem) => {
                    const creature = filteredCreatures[virtualItem.index]
                    return (
                      <div
                        key={virtualItem.key}
                        ref={creatureVirtualizer.measureElement}
                        data-index={virtualItem.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <label className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer">
                          <input
                            type="checkbox"
                            id={`combat-creature-${creature.id}`}
                            name="combat-creatures"
                            checked={selectedCreatureIds.has(creature.id)}
                            onChange={() => toggleCreature(creature.id)}
                            className="w-4 h-4 rounded border-gray-300 mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{creature.name}</p>
                            <p className="text-xs text-gray-500">
                              {tCommon('initSummaryWithType', { initiative: creature.initiative, type: creature.initiativeType })}
                            </p>
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </BaseModal>

      <ConfirmAddCreaturesModal
        isOpen={isOpen && isConfirmOpen}
        onClose={handleCancelConfirm}
        creatures={confirmCreatures}
        onConfirm={handleConfirmAdd}
      />
    </>
  )
}
