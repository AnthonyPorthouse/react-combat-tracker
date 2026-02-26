import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db/db'
import { CategoryList } from './CategoryList'
import { CreatureList } from './CreatureList'

/**
 * Side-by-side panel showing the category list and creature list.
 *
 * Acts as the main management surface on the `/library` route, where
 * the DM can see and edit both collections at once. The `useLiveQuery`
 * call here is intentional even though the result isn't used directly —
 * it ensures `LibraryPanel` re-renders when categories change, which in
 * turn propagates the updated category list down to `CategoryList` and
 * `CreatureList` through their own live queries.
 */
export function LibraryPanel() {
  useLiveQuery(() => db.categories.toArray())

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <CategoryList />
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <CreatureList />
      </div>
    </div>
  );
}
