import { useState, useCallback } from 'react';
import { z } from 'zod';
import type { FormErrors } from '../types/common'

export function useFormValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema
) {
  const [errors, setErrors] = useState<FormErrors>({});

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

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  return { errors, validate, clearErrors, clearFieldError };
}
