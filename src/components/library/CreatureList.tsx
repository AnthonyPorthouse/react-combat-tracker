import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { type Creature } from '../../db/stores/creature';

import { CreatureForm } from './CreatureForm';
import { Edit, Trash2, Plus } from 'lucide-react';

interface CreatureListProps {
  selectedCategoryId?: string;
}

export function CreatureList({ selectedCategoryId }: CreatureListProps) {
  const creatures = useLiveQuery(() => db.creatures.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const [editingCreature, setEditingCreature] = useState<Creature | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCreatures = useMemo(() => {
    if (!creatures) return [];

    return creatures.filter((creature) => {
      const matchesCategory =
        !selectedCategoryId || creature.categoryIds.includes(selectedCategoryId);
      const matchesSearch =
        creature.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [creatures, selectedCategoryId, searchTerm]);

  const handleSave = async (creature: Creature) => {
    if (editingCreature) {
      await db.creatures.update(creature.id, creature);
      setEditingCreature(undefined);
    } else {
      await db.creatures.add(creature);
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this creature?')) {
      await db.creatures.delete(id);
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categories) return '';
    return categories
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.name)
      .join(', ');
  };

  if (isCreating || editingCreature) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingCreature ? 'Edit Creature' : 'Create Creature'}
        </h3>
        <CreatureForm
          creature={editingCreature}
          categories={categories || []}
          onSubmit={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setEditingCreature(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Creatures</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      <input
        type="text"
        placeholder="Search creatures..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
      />

      {!creatures || filteredCreatures.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {creatures?.length === 0
            ? 'No creatures yet. Create one to get started.'
            : 'No creatures match your search.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCreatures.map((creature) => (
            <div
              key={creature.id}
              className="p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="font-medium text-gray-900">{creature.name}</h4>
                  <p className="text-xs text-gray-500">
                    Initiative: {creature.initiative} ({creature.initiativeType === 'fixed' ? 'Fixed' : 'Roll'})
                  </p>
                  {getCategoryNames(creature.categoryIds) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getCategoryNames(creature.categoryIds)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCreature(creature)}
                    className="text-blue-600 hover:text-blue-700 p-1 transition"
                    aria-label="Edit creature"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(creature.id)}
                    className="text-red-600 hover:text-red-700 p-1 transition"
                    aria-label="Delete creature"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
