import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { type Category } from '../../db/stores/categories';
import { CategoryForm } from './CategoryForm';
import { Edit, Trash2, Plus } from 'lucide-react';

export function CategoryList() {
  const categories = useLiveQuery(() => db.categories.toArray());
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async (category: Category) => {
    if (editingCategory) {
      await db.categories.update(category.id, category);
      setEditingCategory(undefined);
    } else {
      await db.categories.add(category);
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await db.categories.delete(id);
      // Also remove the category ID from all creatures
      const creaturesWithCategory = await db.creatures
        .where('categoryIds')
        .equals(id)
        .toArray();
      
      for (const creature of creaturesWithCategory) {
        await db.creatures.update(creature.id, {
          categoryIds: creature.categoryIds.filter(cid => cid !== id),
        });
      }
    }
  };

  if (isCreating || editingCategory) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingCategory ? 'Edit Category' : 'Create Category'}
        </h3>
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setEditingCategory(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-gray-500 text-sm">No categories yet. Create one to organize creatures.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              <span className="text-gray-900">{category.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-600 hover:text-blue-700 p-1 transition"
                  aria-label="Edit category"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700 p-1 transition"
                  aria-label="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
