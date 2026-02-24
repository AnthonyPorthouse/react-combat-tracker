import z from "zod";

export const FixedInitiativeCombatantValidator = z.strictObject({
    id: z.uuid(),
    name: z.string(),
    initiativeType: z.literal('fixed'),
    initiative: z.number().int().nonnegative().default(0),
    hp: z.number().int().nonnegative().default(0),
    maxHp: z.number().int().nonnegative().default(0),
})

export const RolledInitiativeCombatantValidator = z.strictObject({
    id: z.uuid(),
    name: z.string(),
    initiativeType: z.literal('roll'),
    initiative: z.number().int().default(0),
    hp: z.number().int().nonnegative().default(0),
    maxHp: z.number().int().nonnegative().default(0),
})

export const CombatantValidator = z.discriminatedUnion('initiativeType', [FixedInitiativeCombatantValidator, RolledInitiativeCombatantValidator]);

export type Combatant = z.infer<typeof CombatantValidator>;