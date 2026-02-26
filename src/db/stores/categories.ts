import z from "zod";

/**
 * Zod schema for a creature library category.
 *
 * Categories are used to organise and filter library creatures — they have
 * no inherent behaviour beyond grouping. The `z.nanoid()` constraint ensures
 * ids follow the nanoid format used throughout the app, catching accidental
 * UUID or sequential integer ids on import.
 *
 * The minimum length of 1 on `name` prevents saving empty-string categories
 * that would appear as blank rows in the UI.
 */
export const categoryValidator = z.object({
  id: z.nanoid(),
  name: z.string().min(1),
});

export type Category = z.infer<typeof categoryValidator>;