import { useState } from 'react'
import { nanoid } from 'nanoid'
import z from 'zod'
import { CombatantValidator } from '../../../../types/combatant'
import type { Combatant } from '../../../../types/combatant'
import { BaseModal } from '../../../../components/modals/BaseModal'
import { FormField } from '../../../../components/common/FormField'

interface CreateCombatantProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (combatant: Combatant) => void
}

type CombatantFormData = {
  name: string
  initiativeType: 'fixed' | 'roll'
  initiative: string
  hp: string
  maxHp: string
};

type FormErrors = Partial<Record<keyof CombatantFormData, string>>

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
  const [formData, setFormData] = useState<CombatantFormData>({
    name: '',
    initiative: '0',
    initiativeType: 'fixed',
    hp: '0',
    maxHp: '0',
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  /**
   * Generic change handler for all form inputs and selects.
   *
   * Uses the input's `name` attribute as the key into `formData` so a single
   * handler covers every field without per-field callbacks. The error for the
   * changed field is cleared immediately so the user gets real-time visual
   * feedback that they're addressing the problem.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.currentTarget

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof CombatantFormData]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[name as keyof CombatantFormData]
        return next
      })
    }
  }

  /**
   * Validates and submits the form data as a new `Combatant`.
   *
   * Numeric fields are stored as strings in `formData` (so the input can hold
   * an empty string while the user is typing) and are parsed here with
   * `parseInt` before passing to the Zod validator. Zod is the final
   * authority on validity — if it rejects the data, its per-field errors are
   * mapped to the form's error state and the submission is halted.
   *
   * On success, the form resets to defaults so the modal can be reused
   * immediately to add another combatant without manual clearing.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Construct combatant object with generated nanoid
    const combatantData = {
      id: nanoid(),
      name: formData.name,
      initiativeType: formData.initiativeType,
      initiative: parseInt(formData.initiative, 10) || 0,
      hp: parseInt(formData.hp, 10) || 0,
      maxHp: parseInt(formData.maxHp, 10) || 0,
    }

    // Validate using Zod
    const result = CombatantValidator.safeParse(combatantData)

    if (!result.success) {
      // Use z.flattenError() for flat form error structure
      const { fieldErrors } = z.flattenError(result.error)
      const errors: FormErrors = {}
      
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          errors[field as keyof CombatantFormData] = messages[0]
        }
      })
      
      setFormErrors(errors)
      return
    }

    // Valid data - submit, reset, and close
    onSubmit(result.data)
    setFormData({
      name: '',
      initiative: '0',
      initiativeType: 'fixed',
      hp: '0',
      maxHp: '0',
    })
    setFormErrors({})
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Combatant"
      className="max-w-md rounded-none h-screen md:h-auto md:rounded-lg m-0"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Add Combatant
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      }
    >
      <FormField
        id="name"
        label="Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="initiativeType" className="text-sm font-medium text-gray-700">Initiative Type</label>
          <select
            id="initiativeType"
            name="initiativeType"
            value={formData.initiativeType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              formErrors.initiativeType
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required>
            <option value="fixed">Fixed</option>
            <option value="roll">Roll</option>
          </select>
        </div>

        <FormField
          id="initiative"
          label="Initiative"
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
          label="HP"
          type="number"
          name="hp"
          value={formData.hp}
          onChange={handleChange}
          error={formErrors.hp}
        />

        <FormField
          id="maxHp"
          label="Max HP"
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
