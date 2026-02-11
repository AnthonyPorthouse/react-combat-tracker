import './CombatBar.css'

interface CombatBarProps {
  inCombat: boolean;
  round: number;
  step: number;
  onStartCombat: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

export function CombatBar({
  inCombat,
  round,
  step,
  onStartCombat,
  onNextStep,
  onPreviousStep,
}: CombatBarProps) {
  const isPreviousDisabled = !inCombat || (round === 1 && step === 1);

  return (
    <div className="combat-bar">
      <div className="combat-bar-left">
        <button
          onClick={onPreviousStep}
          disabled={isPreviousDisabled}
          className="combat-bar-button"
        >
          ← Previous Step
        </button>
      </div>

      <div className="combat-bar-center">
        {inCombat && (
          <span className="combat-bar-round">Round {round}</span>
        )}
      </div>

      <div className="combat-bar-right">
        {!inCombat ? (
          <button onClick={onStartCombat} className="combat-bar-button">
            Start Combat
          </button>
        ) : (
          <button onClick={onNextStep} className="combat-bar-button">
            Next Step →
          </button>
        )}
      </div>
    </div>
  );
}
