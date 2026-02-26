import z from 'zod'
import { categoryValidator, type Category } from '../../db/stores/categories'
import { creatureValidator, type Creature } from '../../db/stores/creature'

/**
 * Zod schema for a full library export payload.
 *
 * Validates the top-level structure of a library import string — ensuring
 * both `categories` and `creatures` arrays are present and that every item
 * within them conforms to its respective schema before any data is written
 * to IndexedDB. This prevents partial or malformed imports from silently
 * corrupting the library.
 *
 * `strictObject` rejects extra top-level keys (e.g. `combatants` being
 * accidentally pasted from a combat export) with a clear error message.
 */
export const LibraryValidator = z.strictObject({
  categories: z.array(categoryValidator).default([]),
  creatures: z.array(creatureValidator).default([]),
})

export type LibraryState = z.infer<typeof LibraryValidator>

export interface LibraryExportData {
  categories: Category[]
  creatures: Creature[]
}
