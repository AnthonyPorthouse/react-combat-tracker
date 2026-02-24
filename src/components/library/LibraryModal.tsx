import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BaseModal } from '../modals/BaseModal';
import { db } from '../../db/db';
import type { Category } from '../../db/stores/categories';
import type { Creature } from '../../db/stores/creature';
import type { Combatant } from '../../types/combatant';
import { CategoryForm } from './CategoryForm';
import { CreatureForm } from './CreatureForm';
import { creaturesToCombatants } from './useCreaturesFromLibrary';
import { ConfirmAddCreaturesModal } from './ConfirmAddCreaturesModal';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCombatants: (combatants: Combatant[]) => void;
}

export function LibraryModal({
  isOpen,
  onClose,
  onAddCombatants,
}: LibraryModalProps) {
  const creatures = useLiveQuery(() => db.creatures.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const [nameFilter, setNameFilter] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingCreature, setIsAddingCreature] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmCreatures, setConfirmCreatures] = useState<Creature[]>([]);

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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCreature = (creatureId: string) => {
    setSelectedCreatureIds((prev) =>
      prev.includes(creatureId)
        ? prev.filter((id) => id !== creatureId)
        : [...prev, creatureId]
    );
  };

  const handleCreateCategory = async (category: Category) => {
    await db.categories.add(category);
    setIsAddingCategory(false);
  };

  const handleCreateCreature = async (creature: Creature) => {
    await db.creatures.add(creature);
    setIsAddingCreature(false);
  };

  const handleOpenConfirm = () => {
    if (!creatures) return;
    const selected = creatures.filter((c) => selectedCreatureIds.includes(c.id));
    if (selected.length === 0) return;

    setConfirmCreatures(selected);
    setIsConfirmOpen(true);
  };

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

  return (
    <>
      <BaseModal
        isOpen={showLibraryModal}
        onClose={handleCloseModal}
        title="Creature Library"
        className="max-w-5xl"
        actions={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Close
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
              Add to Combat
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
            Add Category
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
            <span>Add Creature</span>
          </button>
        </div>

        {isAddingCategory && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Create Category</h3>
            <CategoryForm
              onSubmit={handleCreateCategory}
              onCancel={() => setIsAddingCategory(false)}
            />
          </div>
        )}

        {isAddingCreature && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Create Creature</h3>
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
                Filter by Name
              </label>
              <input
                id="creature-name-filter"
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Search creatures..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
              {!categories || categories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No categories yet. Add one to organize creatures.
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
                  ? 'No creatures in the library yet.'
                  : 'No creatures match your current filters.'}
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
                      checked={selectedCreatureIds.includes(creature.id)}
                      onChange={() => toggleCreature(creature.id)}
                      className="w-4 h-4 rounded border-gray-300 mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{creature.name}</p>
                      <p className="text-xs text-gray-500">
                        Init: {creature.initiative} ({creature.initiativeType})
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
