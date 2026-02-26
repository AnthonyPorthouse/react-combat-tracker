import z from "zod";

/**
 * Zod schema for a library creature template.
 *
 * A creature is a reusable blueprint that captures how a type of monster or
 * character participates in combat. It is distinct from a `Combatant`, which
 * is a live instance of a creature in an active encounter (see `combatant.ts`).
 *
 * ### Initiative fields
 * - `initiativeType: 'fixed'` — the `initiative` value is the final score
 *   used as-is when combat starts.
 * - `initiativeType: 'roll'` — the `initiative` value is a modifier; a d20
 *   is rolled and added to it when `START_COMBAT` fires.
 *
 * `initiative` uses `z.number().int()` without `.nonnegative()` because
 * modifiers in D&D can be negative (e.g. -2 for a slow creature).
 *
 * ### HP field
 * `hp` stores the creature's maximum hit points as a template value. When a
 * creature is added to combat, both `hp` and `maxHp` on the resulting
 * `Combatant` are seeded from this value. A default of 0 means creatures
 * created before HP tracking was added remain valid and can be updated later.
 *
 * `categoryIds` defaults to an empty array so creatures can exist without
 * belonging to any category.
 */
export const creatureValidator = z.object({
  id: z.nanoid(),
  name: z.string().min(1),
  initiativeType: z.enum(["fixed", "roll"]),
  initiative: z.number().int(),
  hp: z.number().int().nonnegative().default(0),
  categoryIds: z.array(z.string()).default([]),
});

export type Creature = z.infer<typeof creatureValidator>;