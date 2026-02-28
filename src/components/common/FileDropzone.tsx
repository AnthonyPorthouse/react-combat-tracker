import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { Upload, FileCheck } from 'lucide-react'

interface FileDropzoneProps {
  /** Called when a valid file is accepted. */
  onFile: (file: File) => void
  /** Currently selected file, if any — used to show the filename. */
  file: File | null
  /**
   * File type restrictions passed directly to react-dropzone's `accept` prop.
   * Keys are MIME types, values are arrays of allowed file extensions.
   *
   * @example { 'application/octet-stream': ['.ctdata'] }
   */
  accept?: Record<string, string[]>
}

/**
 * A drag-and-drop file upload zone built on top of `react-dropzone`.
 *
 * Handles three visual states:
 * - **Idle** — neutral border, upload icon, instructional label.
 * - **Drag active** — blue highlight to confirm the drop target is valid.
 * - **File selected** — shows the filename with a check icon to give clear
 *   feedback that a file has been registered.
 *
 * Renders a fully accessible zone via the `getRootProps`/`getInputProps`
 * pattern from react-dropzone — keyboard activation (Enter/Space) and
 * screen-reader labels are handled automatically.
 *
 * Only single-file selection is supported (`maxFiles: 1`). Dropping multiple
 * files silently accepts the first accepted file and discards the rest.
 */
export function FileDropzone({ onFile, file, accept }: FileDropzoneProps) {
  const { t } = useTranslation('common')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    onDropAccepted: (files) => {
      if (files[0]) onFile(files[0])
    },
  })

  return (
    <div
      {...getRootProps()}
      className={[
        'flex flex-col items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        isDragActive
          ? 'border-blue-400 bg-blue-50 text-blue-600'
          : file
            ? 'border-green-400 bg-green-50 text-green-700'
            : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100',
      ].join(' ')}
    >
      <input {...getInputProps()} />

      {file ? (
        <>
          <FileCheck size={24} />
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs opacity-70">{t('dropzone.clickToReplace')}</p>
        </>
      ) : (
        <>
          <Upload size={24} />
          <p className="text-sm font-medium">
            {isDragActive ? t('dropzone.dropNow') : t('dropzone.chooseOrDrag')}
          </p>
        </>
      )}
    </div>
  )
}
