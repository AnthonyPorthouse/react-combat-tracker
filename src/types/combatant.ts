import z from "zod";

/**
 * Zod schema for a combatant with a resolved, fixed initiative score.
 *
 * Produced either from a creature whose `initiativeType` was already `'fixed'`,
 * or by converting a `roll`-type combatant when `START_COMBAT` fires (after
 * the d20 is rolled and the modifier is added). Once `START_COMBAT` runs,
 * all combatants in the encounter have `initiativeType: 'fixed'`.
 *
 * `initiative` is constrained to `nonnegative` because a resolved initiative
 * score in D&D can't be negative (the minimum die result is 1).
 */
export const FixedInitiativeCombatantValidator = z.strictObject({
    id: z.nanoid(),
    name: z.string(),
    initiativeType: z.literal('fixed'),
    initiative: z.number().int().nonnegative().default(0),
    hp: z.number().int().nonnegative().default(0),
    maxHp: z.number().int().nonnegative().default(0),
})

/**
 * Zod schema for a combatant whose initiative has not yet been resolved.
 *
 * The `initiative` field here is a **modifier** (can be negative), not a
 * final score. When `START_COMBAT` fires, a d20 is rolled and added to this
 * value, and the combatant is re-validated as a `FixedInitiativeCombatant`.
 * No active-combat combatant should have `initiativeType: 'roll'` after the
 * encounter has started.
 */
export const RolledInitiativeCombatantValidator = z.strictObject({
    id: z.nanoid(),
    name: z.string(),
    initiativeType: z.literal('roll'),
    initiative: z.number().int().default(0),
    hp: z.number().int().nonnegative().default(0),
    maxHp: z.number().int().nonnegative().default(0),
})

/**
 * The union of both combatant variants, discriminated on `initiativeType`.
 *
 * Using a discriminated union means TypeScript (and Zod) can narrow to the
 * correct subtype in any context where `initiativeType` is checked, giving
 * type-safe access to the initiative field's meaning (modifier vs. score).
 */
export const CombatantValidator = z.discriminatedUnion('initiativeType', [FixedInitiativeCombatantValidator, RolledInitiativeCombatantValidator]);

/** A live combatant in an active or pending encounter. */
export type Combatant = z.infer<typeof CombatantValidator>;