import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { BaseModal } from '../../../components/modals/BaseModal';
import { useToast } from '../../../state/toastContext';
import { db } from '../../../db/db';
import type { Category } from '../../../db/stores/categories';
import type { Creature } from '../../../db/stores/creature';
import type { Combatant } from '../../../types/combatant';
import { CategoryForm } from '../components/CategoryForm';
import { CreatureForm } from '../components/CreatureForm';
import { creaturesToCombatants } from '../hooks/useCreaturesFromLibrary';
import { ConfirmAddCreaturesModal } from './ConfirmAddCreaturesModal';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCombatants: (combatants: Combatant[]) => void;
}

/**
 * Full-featured library browser with inline creature and category creation.
 *
 * Extends the read-only `CombatLibraryModal` with the ability to create new
 * categories and creatures without leaving the modal. This is the primary
 * entry point to the library from within the combat tracker, intended for
 * use when the DM wants to add and immediately use a new creature in the
 * current encounter.
 *
 * Inline creation (`isAddingCategory` / `isAddingCreature`) replaces the
 * creature/category list area with the respective form, keeping the modal
 * focused rather than navigating away to a separate route. Only one form
 * can be open at a time — opening one closes the other.
 *
 * The selection + confirmation two-step flow works identically to
 * `CombatLibraryModal`: this modal handles selection and the
 * `ConfirmAddCreaturesModal` handles quantity adjustment.
 */
export function LibraryModal({
  isOpen,
  onClose,
  onAddCombatants,
}: LibraryModalProps) {
  const creatures = useLiveQuery(() => db.creatures.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const { addToast } = useToast();
  const [nameFilter, setNameFilter] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingCreature, setIsAddingCreature] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmCreatures, setConfirmCreatures] = useState<Creature[]>([]);

  /** Closes the modal and resets all transient state (selection, confirm step). */
  const handleCloseModal = () => {
    setIsConfirmOpen(false);
    setConfirmCreatures([]);
    onClose();
  };

  const filteredCreatures = useMemo(() => {
    if (!creatures) return [];
    const loweredName = nameFilter.trim().toLowerCase();

    return creatures.filter((creature) => {
      const matchesName =
        loweredName.length === 0 ||
        creature.name.toLowerCase().includes(loweredName);
      const matchesCategory =
        selectedCategoryIds.length === 0 ||
        creature.categoryIds.some((id) => selectedCategoryIds.includes(id));

      return matchesName && matchesCategory;
    });
  }, [creatures, nameFilter, selectedCategoryIds]);

  /**
   * Toggles a category filter. An empty selection means "show all creatures".
   * Adding a filter narrows the creature list to those assigned to any
   * of the selected categories.
   */
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  /** Toggles a creature's presence in the selection set for the confirm step. */
  const toggleCreature = (creatureId: string) => {
    setSelectedCreatureIds((prev) =>
      prev.includes(creatureId)
        ? prev.filter((id) => id !== creatureId)
        : [...prev, creatureId]
    );
  };

  /**
   * Persists a new category to IndexedDB and hides the inline creation form.
   *
   * The `useLiveQuery` subscription in this component will automatically
   * pick up the new category and re-render the category filter list.
   */
  const handleCreateCategory = async (category: Category) => {
    await db.categories.add(category);
    addToast(t('toast.categoryCreated'));
    setIsAddingCategory(false);
  };

  /**
   * Persists a new creature to IndexedDB and hides the inline creation form.
   *
   * After saving, the creature will appear in the filterable creature list
   * immediately via the live query, so the DM can select it right away
   * without closing and reopening the modal.
   */
  const handleCreateCreature = async (creature: Creature) => {
    await db.creatures.add(creature);
    addToast(t('toast.creatureCreated'));
    setIsAddingCreature(false);
  };

  /**
   * Snapshots the selected creatures and opens the quantity confirmation step.
   *
   * The snapshot is necessary because the `creatures` live query could update
   * between the selection step and the confirmation step (e.g. another tab
   * edits a creature). The confirm modal works from the snapshot, not the
   * live query, for consistency.
   */
  const handleOpenConfirm = () => {
    if (!creatures) return;
    const selected = creatures.filter((c) => selectedCreatureIds.includes(c.id));
    if (selected.length === 0) return;

    setConfirmCreatures(selected);
    setIsConfirmOpen(true);
  };

  /**
   * Expands confirmed creature+quantity pairs into individual combatants
   * and forwards them to the encounter.
   *
   * Each creature is pushed `quantity` times so the reducer's
   * `renumberCombatants` logic receives the correct repetition count for
   * auto-numbering (e.g. 3× Goblin → "Goblin 1", "Goblin 2", "Goblin 3").
   */
  const handleConfirmAdd = (items: { creature: Creature; quantity: number }[]) => {
    const expandedCreatures: Creature[] = [];

    items.forEach(({ creature, quantity }) => {
      for (let i = 0; i < quantity; i += 1) {
        expandedCreatures.push(creature);
      }
    });

    const combatants = creaturesToCombatants(expandedCreatures);
    onAddCombatants(combatants);
    setSelectedCreatureIds([]);
    setIsConfirmOpen(false);
    handleCloseModal();
  };

  const hasSelectedCreatures = selectedCreatureIds.length > 0;
  const showLibraryModal = isOpen && !isConfirmOpen;
  const { t } = useTranslation('library');

  return (
    <>
      <BaseModal
        isOpen={showLibraryModal}
        onClose={handleCloseModal}
        title={t('creatureLibraryTitle')}
        className="max-w-5xl"
        actions={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              {t('close')}
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
              {t('addToCombat')}
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAddingCategory(true);
              setIsAddingCreature(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2"
          >
            <Plus size={16} />
            {t('add', { entity: t('category') })}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingCreature(true);
              setIsAddingCategory(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition flex items-center gap-2"
          >
            <Plus size={16} />
            <span>{t('add', { entity: t('creature') })}</span>
          </button>
        </div>

        {isAddingCategory && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">{t('create', { entity: t('category') })}</h3>
            <CategoryForm
              onSubmit={handleCreateCategory}
              onCancel={() => setIsAddingCategory(false)}
            />
          </div>
        )}

        {isAddingCreature && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">{t('create', { entity: t('creature') })}</h3>
            <CreatureForm
              categories={categories || []}
              onSubmit={handleCreateCreature}
              onCancel={() => setIsAddingCreature(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div>
              <label
                htmlFor="creature-name-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('filterBy', { field: t('name') })}
              </label>
              <input
                id="creature-name-filter"
                name="creature-name-filter"
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder={t('searchCreatures')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t('categories')}</p>
              {!categories || categories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {t('noCategoriesForFilter')}
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
                        id={`lib-cat-${category.id}`}
                        name="library-categories"
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
                  ? t('noCreaturesInLibrary')
                  : t('noCreaturesMatchFilter')}
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
                      id={`lib-creature-${creature.id}`}
                      name="library-creatures"
                      checked={selectedCreatureIds.includes(creature.id)}
                      onChange={() => toggleCreature(creature.id)}
                      className="w-4 h-4 rounded border-gray-300 mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{creature.name}</p>
                      <p className="text-xs text-gray-500">
                        {t('common:initSummaryWithType', { initiative: creature.initiative, type: creature.initiativeType })}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </BaseModal>

      {isOpen && isConfirmOpen ? (
        <ConfirmAddCreaturesModal
          isOpen={isOpen && isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          creatures={confirmCreatures}
          onConfirm={handleConfirmAdd}
        />
      ) : null}
    </>
  );
}
