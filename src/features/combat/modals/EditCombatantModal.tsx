import type { RefObject } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Combatant } from '../../../types/combatant'
import { BaseModal } from '../../../components/modals/BaseModal'
import { FormField, SelectField, Button } from '../../../components/common'
import { useCombatantForm } from '../../../hooks'

interface EditCombatantModalProps {
  isOpen: boolean
  onClose: () => void
  /** Ref to the element that triggered this modal, used for focus restoration. */
  triggerRef: RefObject<HTMLElement | null>
  /** Called with the fully-updated combatant on successful submission. */
  onConfirm: (combatant: Combatant) => void
  combatant: Combatant
}

/**
 * Modal form for editing an existing combatant's values in-place.
 *
 * Pre-populated with the current combatant's data so the DM can make
 * targeted corrections (e.g. fix a name typo, adjust initiative, or set the
 * correct Max HP) without removing and re-adding the combatant. Available
 * both before and during combat, giving flexibility for mid-session adjustments.
 *
 * The combatant's `id` is preserved so referential integrity (turn order,
 * HP history, etc.) is maintained after the edit. Validation uses the same
 * `CombatantValidator` Zod schema as creation, so the same business rules
 * apply regardless of entry point.
 *
 * Form state re-syncs from the `combatant` prop whenever the modal opens,
 * ensuring stale values from a previous edit session don't bleed through.
 * The `key={String(isEditModalOpen)}` pattern on the parent handles remounting.
 */
export function EditCombatantModal({
  isOpen,
  onClose,
  triggerRef,
  onConfirm,
  combatant,
}: EditCombatantModalProps) {
  const { formData, formErrors, handleChange, validate } = useCombatantForm({
    name: combatant.name,
    initiativeType: combatant.initiativeType,
    initiative: String(combatant.initiative),
    hp: String(combatant.hp),
    maxHp: String(combatant.maxHp),
  })
  const { t } = useTranslation('combat')
  const { t: tCommon } = useTranslation('common')

  /**
   * Validates and submits the edited combatant, preserving the original `id`
   * so the combatant's identity (position in turn order, etc.) is unaffected.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validated = validate(combatant.id)
    if (!validated) return
    onConfirm(validated)
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      title={
        <span className="inline-flex items-center gap-2">
          <Pencil size={16} />
          {t('editCombatantTitle', { name: combatant.name })}
        </span>
      }
      className="max-w-md rounded-none h-screen md:h-auto md:rounded-lg m-0"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {t('saveChanges')}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            {tCommon('cancel')}
          </Button>
        </div>
      }
    >
      <FormField
        id="edit-name"
        label={tCommon('name')}
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          id="edit-initiativeType"
          label={tCommon('initiativeType')}
          name="initiativeType"
          value={formData.initiativeType}
          onChange={handleChange}
          error={formErrors.initiativeType}
          required
        >
          <option value="fixed">{tCommon('fixed')}</option>
          <option value="roll">{tCommon('roll')}</option>
        </SelectField>

        <FormField
          id="edit-initiative"
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
          id="edit-hp"
          label={t('hp')}
          type="number"
          name="hp"
          value={formData.hp}
          onChange={handleChange}
          error={formErrors.hp}
        />

        <FormField
          id="edit-maxHp"
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
