import { useState } from 'react'
import type { Combatant } from '../../../types/combatant'

interface UseCombatantActionsOptions {
  combatant: Combatant
  onRemove?: (combatantId: string) => void
  onUpdate?: (combatant: Combatant) => void
}

/**
 * Manages the action state for a single combatant row.
 *
 * Encapsulates the four modal-open flags (remove, heal, harm, edit) and the
 * HP-mutating confirm callbacks so `CombatantItem` and `CombatantActionMenu`
 * stay focused on layout and rendering concerns.
 *
 * HP is clamped on confirm:
 * - Heal: `Math.min(maxHp, hp + amount)` — never exceeds maximum.
 * - Harm: `Math.max(0, hp - amount)` — never drops below zero.
 */
export function useCombatantActions({
  combatant,
  onRemove,
  onUpdate,
}: UseCombatantActionsOptions) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [isHealModalOpen, setIsHealModalOpen] = useState(false)
  const [isHarmModalOpen, setIsHarmModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  /** Confirm handler for the Remove modal — calls the parent-supplied callback. */
  const handleRemoveConfirm = () => {
    onRemove?.(combatant.id)
  }

  /** Confirm handler for the Heal modal — clamps HP to `maxHp`. */
  const handleHealConfirm = (amount: number) => {
    onUpdate?.({ ...combatant, hp: Math.min(combatant.maxHp, combatant.hp + amount) })
  }

  /** Confirm handler for the Harm modal — clamps HP to `0`. */
  const handleHarmConfirm = (amount: number) => {
    onUpdate?.({ ...combatant, hp: Math.max(0, combatant.hp - amount) })
  }

  /** Confirm handler for the Edit modal — passes the updated combatant through. */
  const handleEditConfirm = (updated: Combatant) => {
    onUpdate?.(updated)
  }

  return {
    isRemoveModalOpen,
    openRemoveModal: () => setIsRemoveModalOpen(true),
    closeRemoveModal: () => setIsRemoveModalOpen(false),

    isHealModalOpen,
    openHealModal: () => setIsHealModalOpen(true),
    closeHealModal: () => setIsHealModalOpen(false),

    isHarmModalOpen,
    openHarmModal: () => setIsHarmModalOpen(true),
    closeHarmModal: () => setIsHarmModalOpen(false),

    isEditModalOpen,
    openEditModal: () => setIsEditModalOpen(true),
    closeEditModal: () => setIsEditModalOpen(false),

    handleRemoveConfirm,
    handleHealConfirm,
    handleHarmConfirm,
    handleEditConfirm,
  }
}
