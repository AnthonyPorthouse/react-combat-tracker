import z from "zod";

export const CombatantValidator = z.strictObject({
    id: z.uuid(),
    name: z.string(),
    initiative: z.number().int().nonnegative().default(0),
    hp: z.number().int().nonnegative().default(0),
    maxHp: z.number().int().nonnegative().default(0),
})

export type Combatant = z.infer<typeof CombatantValidator>;