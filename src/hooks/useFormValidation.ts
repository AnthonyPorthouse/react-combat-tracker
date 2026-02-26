import { useState, useCallback } from 'react';
import { z } from 'zod';
import type { FormErrors } from '../types/common'

/**
 * Provides Zod-based form validation with per-field error state.
 *
 * Keeps the same Zod schema used to validate persisted data in sync with the
 * form UI — the schema is the single source of truth for what constitutes
 * valid input. Only the first error per field is surfaced to avoid
 * overwhelming the user with multiple messages for a single input at once.
 *
 * The hook is generic over the form's data shape `T` so TypeScript can
 * enforce that callers pass the right object structure to `validate`.
 *
 * @param schema - The Zod schema to validate form data against. Should match
 *   the shape of `T`.
 * @returns Validation state and helper functions.
 */
export function useFormValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema
) {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validates `data` against the schema.
   *
   * On success, clears all field errors and returns the schema-parsed value
   * (which may include Zod defaults and coercions). On failure, populates the
   * `errors` state with per-field messages and returns `null`. Callers can
   * distinguish success from failure solely by checking for a `null` return.
   *
   * @param data - The raw form data to validate.
   * @returns The parsed, type-safe data on success, or `null` if validation failed.
   */
  const validate = useCallback(
    (data: T) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const flattened = result.error.flatten();
        const fieldErrors: FormErrors = {};
        Object.entries(flattened.fieldErrors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            fieldErrors[key] = messages[0];
          }
        });
        setErrors(fieldErrors);
        return null;
      }
      setErrors({});
      return result.data;
    },
    [schema]
  );

  /** Clears all field errors at once. Useful when resetting a form. */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clears the error for a single field.
   *
   * Called inline on `onChange` to give immediate feedback that the user is
   * addressing a previous error, without waiting for the next full-form
   * validation on submit.
   *
   * @param fieldName - The key in `FormErrors` to clear.
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  return { errors, validate, clearErrors, clearFieldError };
}
