import { useState, useCallback } from 'react'
import z from 'zod'
import { CombatantValidator } from '../types/combatant'
import type { Combatant } from '../types/combatant'

export type CombatantFormData = {
  name: string
  initiativeType: 'fixed' | 'roll'
  initiative: string
  hp: string
  maxHp: string
}

export type CombatantFormErrors = Partial<Record<keyof CombatantFormData, string>>

const DEFAULT_FORM_DATA: CombatantFormData = {
  name: '',
  initiative: '0',
  initiativeType: 'fixed',
  hp: '0',
  maxHp: '0',
}

/**
 * Encapsulates the shared form state, change handling, and Zod validation
 * logic common to both `CreateCombatant` and `EditCombatantModal`.
 *
 * Numeric fields are stored as strings so inputs can hold an empty string
 * while the user is typing; they are coerced via `parseInt` only at submit
 * time. The `clearFieldError` callback is called per-field on change to
 * provide real-time visual feedback that the user is addressing a problem.
 *
 * @param initialValues - Optional pre-populated values for edit mode.
 *   Defaults to empty/zero values for create mode.
 * @returns Form data state, error state, change handler, submit validator,
 *   and a reset function.
 */
export function useCombatantForm(initialValues?: Partial<CombatantFormData>) {
  const [formData, setFormData] = useState<CombatantFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialValues,
  })
  const [formErrors, setFormErrors] = useState<CombatantFormErrors>({})

  /** Generic change handler for all `<input>` and `<select>` fields. */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.currentTarget
      setFormData((prev) => ({ ...prev, [name]: value }))
      setFormErrors((prev) => {
        if (!prev[name as keyof CombatantFormData]) return prev
        const next = { ...prev }
        delete next[name as keyof CombatantFormData]
        return next
      })
    },
    []
  )

  /**
   * Parses string fields to numbers and validates the result against
   * `CombatantValidator`. Returns the validated `Combatant` on success, or
   * `null` after populating `formErrors` on failure.
   *
   * @param id - The combatant id to embed in the validated object.
   */
  const validate = useCallback(
    (id: string): Omit<Combatant, 'initiativeType'> & Pick<Combatant, 'initiativeType'> | null => {
      const data = {
        id,
        name: formData.name,
        initiativeType: formData.initiativeType,
        initiative: parseInt(formData.initiative, 10) || 0,
        hp: parseInt(formData.hp, 10) || 0,
        maxHp: parseInt(formData.maxHp, 10) || 0,
      }

      const result = CombatantValidator.safeParse(data)

      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error)
        const errors: CombatantFormErrors = {}
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            errors[field as keyof CombatantFormData] = messages[0]
          }
        })
        setFormErrors(errors)
        return null
      }

      return result.data
    },
    [formData]
  )

  /** Resets the form to the provided values (or defaults). */
  const reset = useCallback((values?: Partial<CombatantFormData>) => {
    setFormData({ ...DEFAULT_FORM_DATA, ...values })
    setFormErrors({})
  }, [])

  return { formData, formErrors, handleChange, validate, reset }
}
