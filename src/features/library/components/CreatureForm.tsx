import { useState } from 'react';
import { nanoid } from 'nanoid';
import { creatureValidator, type Creature } from '../../../db/stores/creature';
import { type Category } from '../../../db/stores/categories';
import { FormField } from '../../../components/common/FormField';
import { CheckboxItem } from '../../../components/common/CheckboxItem';
import { Button } from '../../../components/common/Button';

interface CreatureFormProps {
  creature?: Creature;
  categories: Category[];
  onSubmit: (creature: Creature) => void;
  onCancel: () => void;
}

export function CreatureForm({
  creature,
  categories,
  onSubmit,
  onCancel,
}: CreatureFormProps) {
  const [name, setName] = useState(creature?.name || '');
  const [initiativeType, setInitiativeType] = useState<'fixed' | 'roll'>((
    creature?.initiativeType || 'fixed'
  ) as 'fixed' | 'roll');
  const [initiative, setInitiative] = useState(creature?.initiative || 0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    creature?.categoryIds || []
  );
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newCreature = creatureValidator.parse({
        id: creature?.id || nanoid(),
        name,
        initiativeType,
        initiative: parseInt(String(initiative), 10),
        categoryIds: selectedCategories,
      });
      onSubmit(newCreature);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="creature-name"
        label="Creature Name"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError('');
        }}
        placeholder="Enter creature name"
        error={error}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="initiative-type" className="block text-sm font-medium text-gray-700 mb-1">
            Initiative Type
          </label>
          <select
            id="initiative-type"
            value={initiativeType}
            onChange={(e) => setInitiativeType(e.target.value as 'fixed' | 'roll')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
          >
            <option value="fixed">Fixed</option>
            <option value="roll">Roll</option>
          </select>
        </div>

        <FormField
          id="initiative"
          label="Initiative Modifier"
          type="number"
          value={initiative}
          onChange={(e) => setInitiative(parseInt(e.target.value, 10))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories yet. Create one first.</p>
          ) : (
            categories.map((category) => (
              <CheckboxItem
                key={category.id}
                id={category.id}
                label={category.name}
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {creature ? 'Update' : 'Create'} Creature
        </Button>
      </div>
    </form>
  );
}
