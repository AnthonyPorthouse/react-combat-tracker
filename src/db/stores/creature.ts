import z from "zod";

export const creatureValidator = z.object({
  id: z.nanoid(),
  name: z.string().min(1),
  initiativeType: z.enum(["fixed", "roll"]),
  initiative: z.number().int(),
  categoryIds: z.array(z.string()).default([]),
});

export type Creature = z.infer<typeof creatureValidator>;