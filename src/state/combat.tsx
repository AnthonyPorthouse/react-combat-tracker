import { createContext, useContext, type Dispatch, type PropsWithChildren, type ReactNode } from 'react'
import { useImmerReducer } from 'use-immer'
import z from "zod";
import { CombatantValidator, type Combatant } from "../types/combatant";

export const CombatValidator = z.strictObject({
    inCombat: z.boolean(),
    round: z.number().int().nonnegative().default(0),
    step: z.number().int().nonnegative().default(0),
    combatants: z.array(CombatantValidator).default([]),
})

export type CombatState = z.infer<typeof CombatValidator>;

export type CombatAction =
    | { type: 'ADD_COMBATANT'; payload: Combatant }
    | { type: 'ADD_COMBATANTS'; payload: Combatant[] }
    | { type: 'REMOVE_COMBATANT'; payload: string }
    | { type: 'UPDATE_COMBATANT'; payload: Combatant }
    | { type: 'REORDER_COMBATANTS'; payload: Combatant[] }
    | { type: 'START_COMBAT' }
    | { type: 'END_COMBAT' }
    | { type: 'NEXT_ROUND' }
    | { type: 'PREVIOUS_ROUND' }
    | { type: 'NEXT_STEP' }
    | { type: 'PREVIOUS_STEP' }
    | { type: 'IMPORT_STATE'; payload: CombatState };

export const initialCombatState: CombatState = {
  inCombat: false,
  round: 0,
  step: 0,
  combatants: [],
};

function getBaseName(name: string): string {
    const match = name.match(/^(.*)\s(\d+)$/);
    if (!match) return name;
    return match[1];
}

function renumberCombatants(combatants: Combatant[]): Combatant[] {
    const grouped = new Map<string, Combatant[]>();

    combatants.forEach((combatant) => {
        const baseName = getBaseName(combatant.name).trim();
        const group = grouped.get(baseName) ?? [];
        group.push(combatant);
        grouped.set(baseName, group);
    });

    return combatants.map((combatant) => {
        const baseName = getBaseName(combatant.name).trim();
        const group = grouped.get(baseName) ?? [];

        if (group.length <= 1) {
            return combatant;
        }

        const index = group.findIndex((member) => member.id === combatant.id);
        const numberedName = `${baseName} ${index + 1}`;

        if (combatant.name === numberedName) {
            return combatant;
        }

        return {
            ...combatant,
            name: numberedName,
        };
    });
}

export function combatReducer(draft: CombatState, action: CombatAction) {
    switch (action.type) {

        case 'START_COMBAT':
            draft.inCombat = true;
            draft.round = 1;
            draft.step = 1;

            // Roll initiative for combatants with 'roll' initiative type
            draft.combatants = draft.combatants.map(c => {
                if (c.initiativeType === 'roll') {
                    return CombatantValidator.parse({
                        ...c,
                        initiativeType: 'fixed',
                        initiative: Math.floor(Math.random() * 20) + 1 + c.initiative,
                    })
                }

                return c;
            })

            draft.combatants.sort((a, b) => b.initiative - a.initiative);
            return;

        case 'END_COMBAT':
            draft.inCombat = false;
            draft.round = 0;
            draft.step = 0;
            draft.combatants = [];
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
            draft.combatants = renumberCombatants([
                ...draft.combatants,
                action.payload,
            ]);
            return;

        case 'ADD_COMBATANTS':
            draft.combatants = renumberCombatants([
                ...draft.combatants,
                ...action.payload,
            ]);
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

        case 'IMPORT_STATE':
            draft.inCombat = action.payload.inCombat;
            draft.round = action.payload.round;
            draft.step = action.payload.step;
            draft.combatants = action.payload.combatants;
            return;

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

interface CombatContextValue {
    state: CombatState
    dispatch: Dispatch<CombatAction>
}

const CombatContext = createContext<CombatContextValue | null>(null)

export function CombatProvider({ children }: PropsWithChildren) {
    const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)

    return (
        <CombatContext.Provider value={{ state, dispatch }}>
            {children}
        </CombatContext.Provider>
    )
}

export function useCombat() {
    const context = useContext(CombatContext)

    if (!context) {
        throw new Error('useCombat must be used within CombatProvider')
    }

    return context
}