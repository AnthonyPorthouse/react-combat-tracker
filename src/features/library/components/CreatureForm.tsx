import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { creatureValidator, type Creature } from '../../../db/stores/creature';
import { type Category } from '../../../db/stores/categories';
import { FormField } from '../../../components/common/FormField';
import { SelectField } from '../../../components/common/SelectField';
import { Button } from '../../../components/common/Button';
import { useFormValidation } from '../../../hooks';
import { CategoryCheckboxList } from './CategoryCheckboxList';

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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(creature?.categoryIds || [])
  );
  const { errors, validate, clearFieldError } = useFormValidation(creatureValidator);
  const { t } = useTranslation('library');
  const { t: tCommon } = useTranslation('common');

  /**
   * Validates and submits the creature data via `creatureValidator`.
   *
   * The `initiative` value is stored as a number in state but `parseInt` is
   * still applied defensively because React number inputs can return NaN on
   * empty string. `String(initiative)` normalises any edge-case types before
   * parsing. As in `CategoryForm`, the existing `creature.id` is reused in
   * edit mode to update the correct record.
   *
   * `validate` returns the parsed value on success or `null` on failure,
   * populating per-field `errors` automatically — no manual try/catch needed.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validate({
      id: creature?.id || nanoid(),
      name,
      initiativeType,
      initiative: parseInt(String(initiative), 10),
      hp: Math.max(0, parseInt(String(hp), 10) || 0),
      categoryIds: Array.from(selectedCategories),
    });
    if (result) {
      onSubmit(result);
    }
  };

  /**
   * Toggles a category ID in the creature's selected category set.
   *
   * Recreates the `Set` on each call so React detects the reference change
   * and re-renders. Using a functional state update avoids stale closure
   * issues when multiple checkboxes are toggled in quick succession.
   */
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="creature-name"
        name="creature-name"
        label={tCommon('entityName', { entity: t('creature') })}
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clearFieldError('name');
        }}
        placeholder={t('creatureNamePlaceholder')}
        error={errors['name']}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          id="initiative-type"
          name="initiative-type"
          label={tCommon('initiativeType')}
          value={initiativeType}
          onChange={(e) => setInitiativeType(e.target.value as 'fixed' | 'roll')}
        >
          <option value="fixed">{tCommon('fixed')}</option>
          <option value="roll">{tCommon('roll')}</option>
        </SelectField>

        <FormField
          id="initiative"
          name="initiative"
          label={t('initiativeModifier')}
          type="number"
          value={initiative}
          onChange={(e) => setInitiative(parseInt(e.target.value, 10))}
          error={errors['initiative']}
        />
      </div>

      <FormField
        id="hp"
        name="hp"
        label={t('hitPoints')}
        type="number"
        value={hp}
        onChange={(e) => setHp(Math.max(0, parseInt(e.target.value, 10) || 0))}
        min={0}
        error={errors['hp']}
      />

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          {t('categoriesLegend')}
        </legend>
        <CategoryCheckboxList
          categories={categories}
          selectedIds={selectedCategories}
          onToggle={toggleCategory}
          noCategoriesMessage={t('noCategoriesInForm')}
        />
      </fieldset>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          {tCommon('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {creature ? t('update', { entity: t('creature') }) : t('create', { entity: t('creature') })}
        </Button>
      </div>
    </form>
  );
}
