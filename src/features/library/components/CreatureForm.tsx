import { useState } from 'react';
import { nanoid } from 'nanoid';
import { creatureValidator, type Creature } from '../../../db/stores/creature';
import { type Category } from '../../../db/stores/categories';
import { FormField } from '../../../components/common/FormField';
import { SelectField } from '../../../components/common/SelectField';
import { CheckboxItem } from '../../../components/common/CheckboxItem';
import { Button } from '../../../components/common/Button';

interface CreatureFormProps {
  creature?: Creature;
  categories: Category[];
  onSubmit: (creature: Creature) => void;
  onCancel: () => void;
}

/**
 * Form for creating or editing a library creature.
 *
 * A creature is a reusable template that stores the name, initiative
 * configuration, and category assignments. When added to combat it is
 * converted to a `Combatant` instance (see `creaturesToCombatants`).
 *
 * Initiative has two modes:
 * - **Fixed:** The displayed initiative value is used as-is at combat start.
 * - **Roll:** The value is treated as a modifier; a d20 is rolled and added
 *   when `START_COMBAT` fires.
 *
 * The label for the initiative field reads "Initiative Modifier" to hint
 * that the value may be used as a roll modifier, not necessarily a final
 * initiative score.
 *
 * When `creature` is provided the form is pre-populated for editing;
 * otherwise it starts blank for creation.
 */
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
  const [hp, setHp] = useState(creature?.hp ?? 0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    creature?.categoryIds || []
  );
  const [error, setError] = useState<string>('');

  /**
   * Validates and submits the creature data via `creatureValidator`.
   *
   * The `initiative` value is stored as a number in state but `parseInt` is
   * still applied defensively because React number inputs can return NaN on
   * empty string. `String(initiative)` normalises any edge-case types before
   * parsing. As in `CategoryForm`, the existing `creature.id` is reused in
   * edit mode to update the correct record.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newCreature = creatureValidator.parse({
        id: creature?.id || nanoid(),
        name,
        initiativeType,
        initiative: parseInt(String(initiative), 10),
        hp: Math.max(0, parseInt(String(hp), 10) || 0),
        categoryIds: selectedCategories,
      });
      onSubmit(newCreature);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  /**
   * Toggles a category id in the creature's selected category set.
   *
   * Uses a functional state update to avoid stale closure issues when
   * multiple checkboxes are toggled in quick succession.
   */
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
        <SelectField
          id="initiative-type"
          label="Initiative Type"
          value={initiativeType}
          onChange={(e) => setInitiativeType(e.target.value as 'fixed' | 'roll')}
        >
          <option value="fixed">Fixed</option>
          <option value="roll">Roll</option>
        </SelectField>

        <FormField
          id="initiative"
          label="Initiative Modifier"
          type="number"
          value={initiative}
          onChange={(e) => setInitiative(parseInt(e.target.value, 10))}
        />
      </div>

      <FormField
        id="hp"
        label="Hit Points"
        type="number"
        value={hp}
        onChange={(e) => setHp(Math.max(0, parseInt(e.target.value, 10) || 0))}
        min={0}
      />

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </legend>
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
      </fieldset>

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
