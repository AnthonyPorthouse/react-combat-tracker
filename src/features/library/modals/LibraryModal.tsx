import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { BaseModal } from '../../../components/modals/BaseModal';
import { useToast } from '../../../state/toastContext';
import { db } from '../../../db/db';
import type { Category } from '../../../db/stores/categories';
import type { Creature } from '../../../db/stores/creature';
import type { Combatant } from '../../../types/combatant';
import { CategoryForm } from '../components/CategoryForm';
import { CreatureForm } from '../components/CreatureForm';
import { CreatureFilterPanel } from '../components/CreatureFilterPanel';
import { useCreatureFilter } from '../hooks/useCreatureFilter';
import { useConfirmAddFlow } from '../hooks/useConfirmAddFlow';
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
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<Set<string>>(
    new Set(),
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingCreature, setIsAddingCreature] = useState(false);
  const { t } = useTranslation('library');
  const { t: tCommon } = useTranslation('common');

  const {
    nameFilter,
    setNameFilter,
    selectedCategoryIds,
    filteredCreatures,
    toggleCategory,
  } = useCreatureFilter(creatures);

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
  });

  /** Closes the modal and resets all transient state (selection, confirm step). */
  const handleCloseModal = () => {
    resetConfirm();
    onClose();
  };

  /** Toggles a creature's presence in the selection set for the confirm step. */
  const toggleCreature = (creatureId: string) => {
    setSelectedCreatureIds((prev) => {
      const next = new Set(prev);
      if (next.has(creatureId)) next.delete(creatureId);
      else next.add(creatureId);
      return next;
    });
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

  const hasSelectedCreatures = selectedCreatureIds.size > 0;
  const showLibraryModal = isOpen && !isConfirmOpen;

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
            {tCommon('add', { entity: t('category') })}
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
            <span>{tCommon('add', { entity: t('creature') })}</span>
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
          <CreatureFilterPanel
            nameFilter={nameFilter}
            onNameFilterChange={setNameFilter}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={toggleCategory}
            categories={categories}
            noCategoriesMessage={t('noCategoriesForFilter')}
            nameInputId="lib-creature-name-filter"
            checkboxIdPrefix="lib-cat"
          />

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
                      id={`lib-creature-${creature.id}`}
                      name="library-creatures"
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
                ))}
              </div>
            )}
          </div>
        </div>
      </BaseModal>

      {isOpen && isConfirmOpen ? (
        <ConfirmAddCreaturesModal
          isOpen={isOpen && isConfirmOpen}
          onClose={handleCancelConfirm}
          creatures={confirmCreatures}
          onConfirm={handleConfirmAdd}
        />
      ) : null}
    </>
  );
}
