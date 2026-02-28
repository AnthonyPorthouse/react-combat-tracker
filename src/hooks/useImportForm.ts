import { useState } from 'react'
import type { ZodType } from 'zod'
import { parseImportBytes, parseImportString } from '../utils/importData'
import type { ExportSource } from '../utils/exportData'

interface UseImportFormOptions<T> {
  /** The export source discriminator that the imported data must match. */
  source: ExportSource
  /** Zod schema used to validate the decoded export payload. */
  validator: ZodType<T>
  /**
   * Called with the validated data after a successful parse. May be async to
   * allow callers to perform side-effects such as database writes before the
   * modal closes.
   */
  onSuccess: (data: T) => void | Promise<void>
  /** Called to close the owning modal after a success or explicit cancel. */
  onClose: () => void
}

export interface UseImportFormReturn {
  fileInput: File | null
  setFileInput: (file: File | null) => void
  textInput: string
  setTextInput: (text: string) => void
  error: string | null
  setError: (error: string | null) => void
  isLoading: boolean
  /** True when at least one import path has content. */
  hasInput: boolean
  /** Resets all transient state and delegates to `onClose`. */
  handleClose: () => void
  /** Form submit handler — runs the import pipeline then calls `onSuccess`. */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

/**
 * Encapsulates the shared state and submission logic used by every import
 * modal in the application.
 *
 * The hook is intentionally free of domain knowledge: it only knows how to
 * drive the file-first / paste-fallback import pipeline and report errors.
 * All domain-specific side-effects (e.g. writing to IndexedDB, updating
 * combat state) are handled by the caller's `onSuccess` callback.
 *
 * @template T - The validated data shape produced by the provided `validator`.
 */
export function useImportForm<T>({
  source,
  validator,
  onSuccess,
  onClose,
}: UseImportFormOptions<T>): UseImportFormReturn {
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const hasInput = fileInput !== null || textInput.trim().length > 0

  const handleClose = () => {
    setFileInput(null)
    setTextInput('')
    setError(null)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const performImport = async () => {
      try {
        let data: T

        if (fileInput) {
          const buffer = await fileInput.arrayBuffer()
          data = await parseImportBytes(buffer, source, validator)
        } else {
          data = await parseImportString(textInput, source, validator)
        }

        await onSuccess(data)
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import data')
      } finally {
        setIsLoading(false)
      }
    }

    performImport()
  }

  return {
    fileInput,
    setFileInput,
    textInput,
    setTextInput,
    error,
    setError,
    isLoading,
    hasInput,
    handleClose,
    handleSubmit,
  }
}
