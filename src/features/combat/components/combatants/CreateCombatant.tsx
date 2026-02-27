import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import type { Combatant } from '../../../../types/combatant'
import { BaseModal } from '../../../../components/modals/BaseModal'
import { FormField, SelectField, Button } from '../../../../components/common'
import { useCombatantForm } from '../../../../hooks'

interface CreateCombatantProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (combatant: Combatant) => void
}

/**
 * Modal form for manually adding a combatant directly to the encounter.
 *
 * Complements the library workflow (browse → select → quantity) with a fast
 * path for one-off combatants that aren't in the library — a custom NPC, an
 * improvised monster, or a player character joining mid-session. The form
 * supports both fixed initiative (DM assigns a specific value) and roll-type
 * (a modifier that will be resolved to a d20 roll when combat starts).
 *
 * HP and Max HP are collected here so manually-added combatants can
 * participate in damage tracking on an equal footing with library creatures.
 *
 * Validation uses the same `CombatantValidator` Zod schema used throughout
 * the app, so the same business rules apply regardless of entry point.
 */
export function CreateCombatant({
  isOpen,
  onClose,
  onSubmit,
}: CreateCombatantProps) {
  const { formData, formErrors, handleChange, validate, reset } = useCombatantForm()
  const { t } = useTranslation('combat')

  /**
   * Validates and submits the form data as a new `Combatant`.
   *
   * On success, the form resets to defaults so the modal can be reused
   * immediately to add another combatant without manual clearing.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validated = validate(nanoid())
    if (!validated) return
    onSubmit(validated)
    reset()
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addNewCombatantTitle')}
      className="max-w-md rounded-none h-screen md:h-auto md:rounded-lg m-0"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {t('addCombatant')}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            {t('cancel')}
          </Button>
        </div>
      }
    >
      <FormField
        id="name"
        label={t('name')}
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          id="initiativeType"
          label={t('initiativeType')}
          name="initiativeType"
          value={formData.initiativeType}
          onChange={handleChange}
          error={formErrors.initiativeType}
          required
        >
          <option value="fixed">{t('fixed')}</option>
          <option value="roll">{t('roll')}</option>
        </SelectField>

        <FormField
          id="initiative"
          label={t('initiative')}
          type="number"
          name="initiative"
          value={formData.initiative}
          onChange={handleChange}
          error={formErrors.initiative}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="hp"
          label={t('hp')}
          type="number"
          name="hp"
          value={formData.hp}
          onChange={handleChange}
          error={formErrors.hp}
        />

        <FormField
          id="maxHp"
          label={t('maxHp')}
          type="number"
          name="maxHp"
          value={formData.maxHp}
          onChange={handleChange}
          error={formErrors.maxHp}
        />
      </div>
    </BaseModal>
  )
}
