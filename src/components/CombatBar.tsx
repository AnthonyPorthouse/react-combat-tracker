import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CombatBarProps {
  inCombat: boolean;
  round: number;
  step: number;
  combatantCount: number;
  onStartCombat: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

export function CombatBar({
  inCombat,
  round,
  step,
  combatantCount,
  onStartCombat,
  onNextStep,
  onPreviousStep,
}: CombatBarProps) {
  const isPreviousDisabled = !inCombat || (round === 1 && step === 1);

  return (
    <div className="flex justify-between items-center gap-4 px-8 py-4 bg-gray-100 border-t border-gray-200">
      <div className="flex items-center gap-4">
        {inCombat && (
          <button
            onClick={onPreviousStep}
            disabled={isPreviousDisabled}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous Step
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!inCombat ? (
          <button onClick={onStartCombat} disabled={combatantCount === 0} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-medium transition-colors">
            Start Combat
          </button>
        ) : (
          <span className="font-bold text-gray-700 text-lg">Round {round}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {inCombat && (
          <button onClick={onNextStep} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2">
            Next Step
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
