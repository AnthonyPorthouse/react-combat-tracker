import type { Combatant } from "../types/combatant";

interface CombatState {
    inCombat: boolean;
    round: number;
    step: number;
    combatants: Combatant[];
}

export type CombatAction =
    | { type: 'ADD_COMBATANT'; payload: Combatant }
    | { type: 'REMOVE_COMBATANT'; payload: string }
    | { type: 'UPDATE_COMBATANT'; payload: Combatant }
    | { type: 'REORDER_COMBATANTS'; payload: Combatant[] }
    | { type: 'START_COMBAT' }
    | { type: 'END_COMBAT' }
    | { type: 'NEXT_ROUND' }
    | { type: 'PREVIOUS_ROUND' }
    | { type: 'NEXT_STEP' }
    | { type: 'PREVIOUS_STEP' };

export const initialCombatState: CombatState = {
  inCombat: false,
  round: 0,
  step: 0,
  combatants: [],
};

export function combatReducer(draft: CombatState, action: CombatAction) {
    switch (action.type) {

        case 'START_COMBAT':
            draft.inCombat = true;
            draft.round = 1;
            draft.step = 1;
            draft.combatants.sort((a, b) => b.initiative - a.initiative);
            return;

        case 'END_COMBAT':
            draft.inCombat = false;
            draft.round = 0;
            draft.step = 0;
            return;

        case 'NEXT_STEP':
            if (draft.step >= draft.combatants.length) {
                draft.step = 1;
                draft.round += 1;
                return;
            }

            draft.step += 1;
            return

        case 'PREVIOUS_STEP':
            if (draft.step == 1 && draft.round == 1) {
                return;
            }

            if (draft.step == 1) {
                draft.step = draft.combatants.length;
                draft.round -= 1;
                return
            }

            draft.step -= 1;
            return;

        case 'ADD_COMBATANT':
            draft.combatants.push(action.payload);
            return;

        case 'REMOVE_COMBATANT':
            draft.combatants = draft.combatants.filter(c => c.id !== action.payload);
            return;

        case 'UPDATE_COMBATANT':
            draft.combatants = draft.combatants.map(c => c.id === action.payload.id ? action.payload : c);
            return;

        case 'REORDER_COMBATANTS':
            draft.combatants = action.payload;
            return;

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}