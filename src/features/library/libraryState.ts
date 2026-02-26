import z from 'zod'
import { categoryValidator, type Category } from '../../db/stores/categories'
import { creatureValidator, type Creature } from '../../db/stores/creature'

export const LibraryValidator = z.strictObject({
  categories: z.array(categoryValidator).default([]),
  creatures: z.array(creatureValidator).default([]),
})

export type LibraryState = z.infer<typeof LibraryValidator>

export interface LibraryExportData {
  categories: Category[]
  creatures: Creature[]
}
