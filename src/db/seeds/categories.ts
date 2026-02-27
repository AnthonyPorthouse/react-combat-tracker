import type { Category } from '../stores/categories'

/**
 * Default categories seeded into a brand-new database on first launch.
 *
 * These map to the standard creature types used in the 5th-edition SRD and
 * give new users a useful starting set without any manual setup. The IDs are
 * pre-generated nanoids so the seed is deterministic across installs.
 *
 * This array is consumed exclusively by the Dexie `populate` event handler
 * in `db.ts`, which fires once when the IndexedDB database is first created.
 * Existing users' data is never affected.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'hL6Lx5RYOj_ViMtZD2oI3', name: 'Aberration' },
  { id: '5Bp7ldzDgpP_OafAMj9pL', name: 'Beast' },
  { id: 'aWqvZp9oborYGfWKSl8Uq', name: 'Celestial' },
  { id: 'TcaCDBtOMx2az4FN6XCZI', name: 'Construct' },
  { id: 'fNTPf83CpbJUfOslXv9Dx', name: 'Dragon' },
  { id: 'oCoBXBAKnh3CqHQQ1P0i5', name: 'Elemental' },
  { id: '2GxyUQ21MGpzXIb50xxko', name: 'Fey' },
  { id: '21mAUDVaww1z9i0TK1Oz6', name: 'Fiend' },
  { id: 'XBzczZgZAjHXVCP3QjJ0m', name: 'Giant' },
  { id: 'EXWRd4hOvn7xM-yKnRQ6g', name: 'Humanoid' },
  { id: 'aCeiGzo6saeHjJjWe01U5', name: 'Monstrosity' },
  { id: 'TmUkOJWKL53ZHQRchxI90', name: 'Ooze' },
  { id: 'CCPdjktUPMbqrwM6x7Z1B', name: 'Plant' },
  { id: 'tZbowWTtyW9OA7jObqNru', name: 'Undead' },
]
