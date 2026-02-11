import { useState } from 'react'
import { createPortal } from 'react-dom'
import { v7 as uuidv7 } from 'uuid'
import z from 'zod'
import { CombatantValidator } from '../../types/combatant'
import type { Combatant } from '../../types/combatant'
import './CreateCombatant.css'

interface CreateCombatantProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (combatant: Combatant) => void
}

type CombatantFormData = {
  name: string
  initiative: string
  hp: string
  maxHp: string
}

type FormErrors = Partial<Record<keyof CombatantFormData, string>>

export function CreateCombatant({
  isOpen,
  onClose,
  onSubmit,
}: CreateCombatantProps) {
  const [formData, setFormData] = useState<CombatantFormData>({
    name: '',
    initiative: '0',
    hp: '0',
    maxHp: '0',
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Construct combatant object with generated UUID v7
    const combatantData = {
      id: uuidv7(),
      name: formData.name,
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
        if (messages && messages.length > 0) {
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
      hp: '0',
      maxHp: '0',
    })
    setFormErrors({})
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Combatant</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="combatant-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'input-error' : ''}
              required
            />
            {formErrors.name && (
              <span className="error-message">{formErrors.name}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="initiative">Initiative</label>
              <input
                id="initiative"
                type="number"
                name="initiative"
                value={formData.initiative}
                onChange={handleChange}
                className={formErrors.initiative ? 'input-error' : ''}
              />
              {formErrors.initiative && (
                <span className="error-message">{formErrors.initiative}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hp">HP</label>
              <input
                id="hp"
                type="number"
                name="hp"
                value={formData.hp}
                onChange={handleChange}
                className={formErrors.hp ? 'input-error' : ''}
              />
              {formErrors.hp && (
                <span className="error-message">{formErrors.hp}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="maxHp">Max HP</label>
              <input
                id="maxHp"
                type="number"
                name="maxHp"
                value={formData.maxHp}
                onChange={handleChange}
                className={formErrors.maxHp ? 'input-error' : ''}
              />
              {formErrors.maxHp && (
                <span className="error-message">{formErrors.maxHp}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="button-secondary">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Add Combatant
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')!,
  )
}
