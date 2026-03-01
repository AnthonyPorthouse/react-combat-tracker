import { useTranslation } from 'react-i18next'

interface CombatantHpBarProps {
  /** Current hit points */
  hp: number
  /** Maximum hit points */
  maxHp: number
  /** Combatant name used in the accessible label */
  name: string
}

/**
 * Pure presentational HP bar for a single combatant.
 *
 * Computes the filled percentage and transitions the bar colour from green
 * (full health) through yellow to red (near death) via HSL hue interpolation.
 * Renders a semantic `role="progressbar"` element with accessible ARIA labels.
 *
 * Rendering is conditional on the parent — only mount this component when the
 * encounter is active (`inCombat === true`).
 */
export function CombatantHpBar({ hp, maxHp, name }: CombatantHpBarProps) {
  const { t } = useTranslation('combat')

  const hpPct = maxHp > 0 ? Math.min(hp / maxHp, 1) : 0
  const hpHue = hpPct * 120

  return (
    <div
      role="progressbar"
      aria-valuenow={hp}
      aria-valuemin={0}
      aria-valuemax={maxHp}
      aria-label={t('combatantHitPoints', { name, hp, maxHp })}
      className="h-1 w-full bg-gray-100"
    >
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${hpPct * 100}%`,
          backgroundColor: `hsl(${hpHue}, 70%, 45%)`,
        }}
      />
    </div>
  )
}
