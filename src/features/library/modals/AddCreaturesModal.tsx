import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { BaseModal } from '../../../components/modals/BaseModal';
import { creaturesToCombatants } from '../hooks/useCreaturesFromLibrary';

interface AddCreaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCreatures: (combatants: ReturnType<typeof creaturesToCombatants>) => void;
}

/**
 * An older creature-selection modal used to add library creatures to combat.
 *
 * @deprecated Superseded by the `CombatLibraryModal` + `ConfirmAddCreaturesModal`
 * two-step flow, which adds quantity selection and category filtering. This
 * component is kept to avoid breaking any consumers that may still reference
 * it, but new code should use `CombatLibraryModal` instead.
 *
 * Differences from the current flow:
 * - No quantity selection — each selected creature is added once.
 * - Single-select category filter via a `<select>` dropdown rather than
 *   multi-select checkboxes.
 * - Adds combatants one-at-a-time via individual `onAddCreatures` calls
 *   rather than a single bulk dispatch.
 */
export function AddCreaturesModal({
  isOpen,
  onClose,
  onAddCreatures,
}: AddCreaturesModalProps) {
  const creatures = useLiveQuery(() => db.creatures.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation('library');

  const filteredCreatures = useMemo(() => {
    if (!creatures) return [];

    return creatures.filter((creature) => {
      const matchesCategory =
        selectedCategoryId === 'all' ||
        creature.categoryIds.includes(selectedCategoryId);
      const matchesSearch =
        creature.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [creatures, selectedCategoryId, searchTerm]);

  /** Toggles a creature's presence in the selection set. */
  const toggleCreature = (creatureId: string) => {
    setSelectedCreatureIds((prev) =>
      prev.includes(creatureId)
        ? prev.filter((id) => id !== creatureId)
        : [...prev, creatureId]
    );
  };

  /**
   * Converts the selected creatures to combatants and notifies the parent.
   * Resets all local state on completion so the modal is clean if reopened.
   */
  const handleAddCreatures = () => {
    if (!creatures) return;

    const creaturesToAdd = creatures.filter((c) =>
      selectedCreatureIds.includes(c.id)
    );
    const combatants = creaturesToCombatants(creaturesToAdd);

    combatants.forEach((combatant) => {
      onAddCreatures([combatant]);
    });

    setSelectedCreatureIds([]);
    setSearchTerm('');
    setSelectedCategoryId('all');
    onClose();
  };

  /** Resolves category ids to a comma-separated display string. Returns empty string while categories are loading. */
  const getCategoryNames = (categoryIds: string[]) => {
    if (!categories) return '';
    return categories
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.name)
      .join(', ');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addCreaturesFromLibrary')}
      onSubmit={selectedCreatureIds.length > 0 ? (e) => {
        e.preventDefault();
        handleAddCreatures();
      } : undefined}
      actions={
        selectedCreatureIds.length > 0 ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {t('addCreaturesCount', { count: selectedCreatureIds.length })}
            </button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        {categories && categories.length > 0 && (
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t('filterBy', { field: t('category') })}
            </label>
            <select
              id="category-filter"
              name="category-filter"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          type="text"
          id="creature-search"
          name="creature-search"
          aria-label={t('searchCreatures')}
          placeholder={t('searchCreatures')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
        />

        {!creatures || filteredCreatures.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            {creatures?.length === 0
              ? t('noCreaturesInLibraryShort')
              : t('noCreaturesMatchFilterShort')}
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
            {filteredCreatures.map((creature) => (
              <label
                key={creature.id}
                className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  id={`add-creature-${creature.id}`}
                  name="selected-creatures"
                  checked={selectedCreatureIds.includes(creature.id)}
                  onChange={() => toggleCreature(creature.id)}
                  className="w-4 h-4 rounded border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {creature.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t('common:initSummaryWithType', { initiative: creature.initiative, type: creature.initiativeType })}
                  </p>
                  {getCategoryNames(creature.categoryIds) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getCategoryNames(creature.categoryIds)}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
