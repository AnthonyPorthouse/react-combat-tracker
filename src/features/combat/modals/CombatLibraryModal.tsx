import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { db } from '../../../db/db'
import type { Creature } from '../../../db/stores/creature'
import type { Combatant } from '../../../types/combatant'
import { creaturesToCombatants } from '../../library/hooks/useCreaturesFromLibrary'
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
  const creatures = useLiveQuery(() => db.creatures.orderBy('name').toArray())
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray())
  const [nameFilter, setNameFilter] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<string[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmCreatures, setConfirmCreatures] = useState<Creature[]>([])

  const filteredCreatures = useMemo(() => {
    if (!creatures) return []
    const loweredName = nameFilter.trim().toLowerCase()

    return creatures.filter((creature) => {
      const matchesName =
        loweredName.length === 0 ||
        creature.name.toLowerCase().includes(loweredName)
      const matchesCategory =
        selectedCategoryIds.length === 0 ||
        creature.categoryIds.some((id) => selectedCategoryIds.includes(id))

      return matchesName && matchesCategory
    })
  }, [creatures, nameFilter, selectedCategoryIds])

  /** Closes both this modal and any open confirm modal, resetting all local state. */
  const handleCloseModal = () => {
    setIsConfirmOpen(false)
    setConfirmCreatures([])
    onClose()
  }

  /**
   * Toggles a category filter on or off.
   *
   * When at least one category is selected, only creatures assigned to that
   * category are shown. When the selection is empty, all creatures are shown —
   * an empty filter means "show everything", not "show nothing".
   */
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  /** Toggles a creature's presence in the selection set. */
  const toggleCreature = (creatureId: string) => {
    setSelectedCreatureIds((prev) =>
      prev.includes(creatureId)
        ? prev.filter((id) => id !== creatureId)
        : [...prev, creatureId]
    )
  }

  /**
   * Transitions from the selection step to the quantity confirmation step.
   *
   * Snapshots the currently selected creatures into `confirmCreatures` before
   * opening the confirm modal, so the quantity form shows exactly what was
   * selected even if the underlying `creatures` live query updates between
   * the two steps.
   */
  const handleOpenConfirm = () => {
    if (!creatures) return
    const selected = creatures.filter((c) => selectedCreatureIds.includes(c.id))
    if (selected.length === 0) return

    setConfirmCreatures(selected)
    setIsConfirmOpen(true)
  }

  /**
   * Expands the confirmed creature+quantity pairs into individual combatants
   * and dispatches them to the encounter.
   *
   * Each creature is pushed `quantity` times into a flat array before being
   * passed to `creaturesToCombatants` — this allows the combatant auto-
   * numbering logic in the reducer to correctly group and number identical
   * creatures (e.g. 3× Goblin → "Goblin 1", "Goblin 2", "Goblin 3").
   */
  const handleConfirmAdd = (items: { creature: Creature; quantity: number }[]) => {
    const expandedCreatures: Creature[] = []

    items.forEach(({ creature, quantity }) => {
      for (let i = 0; i < quantity; i += 1) {
        expandedCreatures.push(creature)
      }
    })

    const combatants = creaturesToCombatants(expandedCreatures)
    onAddCombatants(combatants)
    setSelectedCreatureIds([])
    setIsConfirmOpen(false)
    handleCloseModal()
  }

  const hasSelectedCreatures = selectedCreatureIds.length > 0
  const showLibraryModal = isOpen && !isConfirmOpen
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

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
              onClick={handleOpenConfirm}
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
          <div className="md:col-span-1 space-y-4">
            <div>
              <label
                htmlFor="creature-name-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {tCommon('filterBy', { field: tCommon('name') })}
              </label>
              <input
                id="creature-name-filter"
                name="creature-name-filter"
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder={tCommon('searchCreatures')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{tCommon('categories')}</p>
              {!categories || categories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {t('noCategoriesYet')}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        id={`combat-cat-${category.id}`}
                        name="combat-categories"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {!creatures || filteredCreatures.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                {creatures?.length === 0
                  ? tCommon('noCreaturesInLibrary')
                  : tCommon('noCreaturesMatchFilter')}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                {filteredCreatures.map((creature) => (
                  <label
                    key={creature.id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={`combat-creature-${creature.id}`}
                      name="combat-creatures"
                      checked={selectedCreatureIds.includes(creature.id)}
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
                ))}
              </div>
            )}
          </div>
        </div>
      </BaseModal>

      <ConfirmAddCreaturesModal
        isOpen={isOpen && isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        creatures={confirmCreatures}
        onConfirm={handleConfirmAdd}
      />
    </>
  )
}
