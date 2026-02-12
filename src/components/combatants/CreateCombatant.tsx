import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus } from 'lucide-react'
import { v7 as uuidv7 } from 'uuid'
import z from 'zod'
import { CombatantValidator } from '../../types/combatant'
import type { Combatant } from '../../types/combatant'

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

  const handleSubmit = (e: React.SubmitEvent) => {
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
    <div className="fixed inset-0 bg-black/50 md:flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-y-auto md:rounded-lg md:max-w-md md:overflow-y-auto md:m-0 rounded-none h-screen md:h-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Add New Combatant</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                formErrors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {formErrors.name && (
              <span className="text-sm text-red-600">{formErrors.name}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="initiative" className="text-sm font-medium text-gray-700">Initiative</label>
              <input
                id="initiative"
                type="number"
                name="initiative"
                value={formData.initiative}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  formErrors.initiative
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formErrors.initiative && (
                <span className="text-sm text-red-600">{formErrors.initiative}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="hp" className="text-sm font-medium text-gray-700">HP</label>
              <input
                id="hp"
                type="number"
                name="hp"
                value={formData.hp}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  formErrors.hp
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formErrors.hp && (
                <span className="text-sm text-red-600">{formErrors.hp}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="maxHp" className="text-sm font-medium text-gray-700">Max HP</label>
              <input
                id="maxHp"
                type="number"
                name="maxHp"
                value={formData.maxHp}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  formErrors.maxHp
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formErrors.maxHp && (
                <span className="text-sm text-red-600">{formErrors.maxHp}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2">
              <Plus size={18} />
              Add Combatant
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')!,
  )
}
