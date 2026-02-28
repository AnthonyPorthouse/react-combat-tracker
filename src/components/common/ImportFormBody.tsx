import { useTranslation } from 'react-i18next'
import { FileDropzone } from './FileDropzone'

interface ImportFormBodyProps {
  /** Currently selected file, if any. */
  fileInput: File | null
  /** Called when a file is accepted by the dropzone. */
  onFile: (file: File) => void
  /** Current value of the paste textarea. */
  textInput: string
  /** Called when the textarea value changes. */
  onTextChange: (text: string) => void
  /** Validation or parse error to display below the textarea. */
  error: string | null
  /** Clears any active error — called when the user updates input. */
  onErrorClear: () => void
  /**
   * The `id` and `name` attributes for the textarea element.
   *
   * Using a per-modal value (e.g. `"import-data"` vs `"import-library-data"`)
   * keeps label associations unique if both modals ever exist in the DOM
   * concurrently (though in practice only one is open at a time).
   */
  inputName: string
  /** The `aria-label` and `placeholder` text for the paste textarea. */
  textareaLabel: string
}

/**
 * Shared form body used by every import modal.
 *
 * Renders the two import paths in order of precedence:
 * 1. **File upload** — a `<FileDropzone>` for `.ctdata` files.
 * 2. **Paste** — a `<textarea>` for the base64 export string.
 *
 * All state is owned by the parent via `useImportForm`; this component is
 * purely presentational so it can be dropped into any modal shell without
 * bringing its own state or domain logic.
 */
export function ImportFormBody({
  fileInput,
  onFile,
  textInput,
  onTextChange,
  error,
  onErrorClear,
  inputName,
  textareaLabel,
}: ImportFormBodyProps) {
  const { t: tCommon } = useTranslation('common')

  return (
    <>
      <FileDropzone
        file={fileInput}
        accept={{ 'application/octet-stream': ['.ctdata'] }}
        onFile={(f) => { onFile(f); onErrorClear() }}
      />

      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 shrink-0">{tCommon('orPasteString')}</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <textarea
        id={inputName}
        name={inputName}
        aria-label={textareaLabel}
        value={textInput}
        onChange={(e) => {
          onTextChange(e.target.value)
          if (error) onErrorClear()
        }}
        placeholder={textareaLabel}
        className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-300 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </>
  )
}
