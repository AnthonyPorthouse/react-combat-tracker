import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { categoryValidator, type Category } from '../../../db/stores/categories';
import { FormField } from '../../../components/common/FormField';
import { Button } from '../../../components/common/Button';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Category) => void;
  onCancel: () => void;
}

/**
 * Form component for creating or editing a library category.
 *
 * Categories are purely organisational — they have only a name and are
 * used to filter creatures in the library and combat library browser.
 * Validation is done via `categoryValidator` (the same Zod schema used for
 * persistence) so invalid names (empty string, etc.) are caught before the
 * record is written to IndexedDB.
 *
 * When `category` is provided, the form is in edit mode: the existing name
 * pre-populates the field and the submit button reads "Update Category".
 * When omitted, it is in create mode: a new nanoid is generated on submit.
 */
export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [error, setError] = useState<string>('');
  const { t } = useTranslation('library');

  /**
   * Validates and submits the category name via the Zod validator.
   *
   * Reuses the existing `category.id` in edit mode to avoid creating a
   * duplicate record — the caller is expected to `update` rather than `add`
   * when an id is already present. In create mode a new nanoid is generated
   * here so the caller always receives a fully-formed `Category` object.
   */
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
        label={t('categoryName')}
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
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {category ? t('updateCategory') : t('createCategory')}
        </Button>
      </div>
    </form>
  );
}
