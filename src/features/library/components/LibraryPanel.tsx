import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db/db'
import { CategoryList } from './CategoryList'
import { CreatureList } from './CreatureList'

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
