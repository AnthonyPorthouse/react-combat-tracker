import { useState } from 'react'
import { Heart, Swords } from 'lucide-react'
import { BaseModal } from '../../../components/modals/BaseModal'
import { Button } from '../../../components/common'

interface UpdateHpModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called with the raw positive amount entered by the user. The caller is
   *  responsible for applying the delta (add or subtract) and clamping. */
  onConfirm: (amount: number) => void
  combatantName: string
  mode: 'harm' | 'heal'
}

/**
 * Modal prompt for applying a HP change (harm or heal) to a combatant.
 *
 * A single component handles both directions (harm / heal) via the `mode`
 * prop so the form logic — a single positive-integer input — is not
 * duplicated. Visual affordances (title, icon, submit button colour) vary
 * by mode to make the intent clear at a glance and reduce the chance of
 * the DM accidentally harming when they meant to heal.
 *
 * The modal does not itself clamp the resulting HP value. The caller
 * (`CombatantItem`) receives the raw positive amount and applies the
 * appropriate `Math.max` / `Math.min` bounds before dispatching
 * `UPDATE_COMBATANT`. This keeps the modal generic and independently testable.
 *
 * Amount state resets to 1 when the modal closes so re-opening always shows
 * a clean default rather than the last entered value.
 */
export function UpdateHpModal({
  isOpen,
  onClose,
  onConfirm,
  combatantName,
  mode,
}: UpdateHpModalProps) {
  const [amount, setAmount] = useState(1)

  const isHeal = mode === 'heal'
  const title = isHeal ? `Heal ${combatantName}` : `Harm ${combatantName}`
  const icon = isHeal ? <Heart size={16} /> : <Swords size={16} />

  const handleClose = () => {
    setAmount(1)
    onClose()
  }

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    const value = Math.max(1, Math.floor(amount))
    onConfirm(value)
    setAmount(1)
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="inline-flex items-center gap-2">
          {icon}
          {title}
        </span>
      }
      className="max-w-sm"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant={isHeal ? 'primary' : 'danger'} className="flex-1">
            {isHeal ? 'Heal' : 'Harm'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="hp-amount" className="text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="hp-amount"
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500 text-lg font-mono"
          autoFocus
        />
      </div>
    </BaseModal>
  )
}
