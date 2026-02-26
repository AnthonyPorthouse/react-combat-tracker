import { nanoid } from 'nanoid';
import type { Creature } from '../../../db/stores/creature';
import type { Combatant } from '../../../types/combatant';

/**
 * Converts library creature templates into fresh combatant instances for
 * an active encounter.
 *
 * Each call produces a new unique `id` (via nanoid) so multiple copies of
 * the same creature become independent combatants — the original library
 * entry is never mutated. This separation between "template" (Creature in
 * the library) and "instance" (Combatant in the encounter) is intentional:
 * editing a library creature after combat has started should not retroactively
 * change the stats of combatants already in the encounter.
 *
 * HP fields default to 0 because the Creature schema does not yet include
 * baseline HP. They can be set manually via `CreateCombatant` or in a
 * future library schema version.
 *
 * @param creatures - The library creatures to instantiate. Pass the same
 *   creature multiple times to create multiple independent combatants of
 *   the same type (the auto-numbering logic in the reducer will name them
 *   "Goblin 1", "Goblin 2", etc.).
 * @returns An array of new `Combatant` objects ready to dispatch as
 *   `ADD_COMBATANTS`.
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
