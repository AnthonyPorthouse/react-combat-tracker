import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../components/common/Button'

interface CombatBarProps {
  inCombat: boolean;
  round: number;
  step: number;
  combatantCount: number;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

/**
 * The persistent footer control bar for a combat encounter.
 *
 * Surfaces the three distinct phases of combat through a single bar that
 * changes layout based on state, rather than showing/hiding separate UI
 * sections:
 *
 * - **Pre-combat:** Shows only "Start Combat". Disabled while the combatant
 *   list is empty so the user can't start a round with nobody in it.
 * - **Active combat:** Shows Previous Step ← Round N / End Combat → Next Step.
 *   Previous is disabled on the very first step of round 1 since there is
 *   nothing to go back to.
 *
 * All state and dispatch are owned by the parent; this component is purely
 * presentational and calls the appropriate callback prop on each action.
 */
export function CombatBar({
  inCombat,
  round,
  step,
  combatantCount,
  onStartCombat,
  onEndCombat,
  onNextStep,
  onPreviousStep,
}: CombatBarProps) {
  const isPreviousDisabled = !inCombat || (round === 1 && step === 1);

  return (
    <div className="flex justify-between items-center gap-4 px-8 py-4 bg-gray-100 border-t border-gray-200">
      <div className="flex items-center gap-4">
        {inCombat && (
          <Button
            onClick={onPreviousStep}
            disabled={isPreviousDisabled}
            variant="success"
            size="sm"
            icon={<ChevronLeft size={16} />}
          >
            Previous Step
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!inCombat ? (
          <Button 
            onClick={onStartCombat} 
            disabled={combatantCount === 0}
            variant="success"
            size="sm"
          >
            Start Combat
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className="font-bold text-gray-700 text-lg"
              aria-live="polite"
              aria-atomic="true"
            >
              Round {round}
            </span>
            <Button
              onClick={onEndCombat}
              variant="danger"
              size="sm"
            >
              End Combat
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {inCombat && (
          <Button 
            onClick={onNextStep}
            variant="success"
            size="sm"
            icon={<ChevronRight size={16} />}
          >
            Next Step
          </Button>
        )}
      </div>
    </div>
  );
}
