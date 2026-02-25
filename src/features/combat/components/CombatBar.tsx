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
            <span className="font-bold text-gray-700 text-lg">Round {round}</span>
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
