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

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
    switch (action.type) {

        case 'START_COMBAT':
            return {
                ...state,
                inCombat: true,
                round: 1,
                step: 1,
                combatants: [...state.combatants].sort((a, b) => b.initiative - a.initiative),
            };

        case 'END_COMBAT':
            return {
                ...state,
                inCombat: false,
                round: 0,
                step: 0,
                combatants: [],
            };

        case 'NEXT_STEP':
            if (state.step >= state.combatants.length) {
                return {
                    ...state,
                    step: 1,
                    round: state.round + 1,
                };
            }

            return {
                ...state,
                step: state.step + 1,
            };

        case 'PREVIOUS_STEP':
            if (state.step <= 1) {
                if (state.round <= 1) {
                    return state;
                }
                return {
                    ...state,
                    step: state.combatants.length,
                    round: state.round - 1,
                };
            }

            return {
                ...state,
                step: state.step - 1,
            };

        case 'ADD_COMBATANT':
            return {
                ...state,
                combatants: [...state.combatants, action.payload],
            };

        case 'REMOVE_COMBATANT':
            return {
                ...state,
                combatants: state.combatants.filter(c => c.id !== action.payload),
            };

        case 'UPDATE_COMBATANT':
            return {
                ...state,
                combatants: state.combatants.map(c => c.id === action.payload.id ? action.payload : c),
            };

        case 'REORDER_COMBATANTS':
            return {
                ...state,
                combatants: action.payload,
            };

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}