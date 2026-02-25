import { useState } from 'react';
import { nanoid } from 'nanoid';
import { categoryValidator, type Category } from '../../../db/stores/categories';
import { FormField } from '../../../components/common/FormField';
import { Button } from '../../../components/common/Button';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Category) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newCategory = categoryValidator.parse({
        id: category?.id || nanoid(),
        name,
      });
      onSubmit(newCategory);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="category-name"
        label="Category Name"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError('');
        }}
        placeholder="Enter category name"
        error={error}
        required
      />

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {category ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
}
