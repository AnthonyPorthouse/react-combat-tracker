import z from "zod";

export const categoryValidator = z.object({
  id: z.nanoid(),
  name: z.string().min(1),
});

export type Category = z.infer<typeof categoryValidator>;