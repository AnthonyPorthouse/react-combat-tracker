import { nanoid } from 'nanoid';
import type { Creature } from '../../../db/stores/creature';
import type { Combatant } from '../../../types/combatant';

/**
 * Converts creatures from the library to combatants ready for combat.
 */
export function creaturesToCombatants(creatures: Creature[]): Combatant[] {
  return creatures.map(creature => {
    return {
      id: nanoid(),
      name: creature.name,
      initiativeType: creature.initiativeType,
      initiative: creature.initiative,
      hp: 0,
      maxHp: 0,
    };
  });
}
