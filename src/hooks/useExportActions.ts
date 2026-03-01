import { useEffect, useRef, useState } from 'react'
import { createExportBytes, createExportString } from '../utils/exportData'
import type { ExportSource } from '../utils/exportData'
import { useCopyToClipboard } from './useCopyToClipboard'

interface UseExportActionsOptions<T> {
  /**
   * The export source identifier, used to tag the payload envelope and
   * allow the importer to reject mismatched file types before full
   * validation runs.
   */
  exportType: ExportSource
  /**
   * Async function that resolves to the data to be exported.
   *
   * The resolved value is cached in a ref so that `handleDownload` can
   * reuse it without a second fetch. The ref is always kept current, so an
   * inline arrow at the call site is safe — it will not cause the effect to
   * re-run more than intended.
   */
  getData: () => Promise<T>
  /** The filename to use when the user triggers a file download. */
  filename: string
  /**
   * Effect dependency that controls when the export string is regenerated.
   *
   * Pass the relevant piece of state so the hook mirrors the original
   * per-modal behaviour:
   * - `state` for combat — regenerates whenever the combat snapshot changes
   * - `isOpen` for library — regenerates only when the modal first opens
   *
   * A falsy value (e.g. `isOpen === false`) skips the effect entirely,
   * preserving the `if (!isOpen) return` guard from the original
   * `ExportLibraryModal`.
   */
  trigger: unknown
}

interface UseExportActionsReturn {
  /** The HMAC-signed, base64-encoded export string ready for display or copy. */
  exportString: string
  /** Downloads the export as a binary `.ctdata` file and revokes the object URL immediately after. */
  handleDownload: () => Promise<void>
  /** Copies the export string to the system clipboard. */
  handleCopy: () => void
  /** `true` while the clipboard copy feedback timer is active. */
  copied: boolean
}

/**
 * Encapsulates the shared download-and-copy logic used by both the combat
 * and library export modals.
 *
 * Each modal previously duplicated `useCopyToClipboard`, a `useState` for the
 * export string, a `useEffect` to regenerate it, a `handleDownload` with
 * object-URL lifecycle, and a `handleCopy` handler.  This hook extracts all
 * of that, leaving each modal to only supply what differs: the data source,
 * export type, filename, and the reactive trigger.
 *
 * Object-URL lifecycle: the URL is created immediately before the anchor
 * click and revoked synchronously after, so it is never held longer than a
 * single task.
 */
export function useExportActions<T>({
  exportType,
  getData,
  filename,
  trigger,
}: UseExportActionsOptions<T>): UseExportActionsReturn {
  const { copied, copyToClipboard } = useCopyToClipboard()
  const [exportString, setExportString] = useState<string>('')

  /**
   * Always-current ref to the getData callback.  Storing it in a ref lets
   * the effect depend only on `trigger` (matching the original modal
   * behaviour) without requiring the caller to memoize `getData`.
   */
  const getDataRef = useRef(getData)
  getDataRef.current = getData

  /**
   * Cache of the last successfully fetched data value.  `handleDownload`
   * reads from this ref to avoid a redundant async call when the data was
   * already fetched to build `exportString`.
   */
  const dataRef = useRef<T | null>(null)

  useEffect(() => {
    if (!trigger) return

    let cancelled = false

    const generate = async () => {
      try {
        const data = await getDataRef.current()
        if (cancelled) return
        dataRef.current = data
        const result = await createExportString(exportType, data)
        if (cancelled) return
        setExportString(result)
      } catch (err) {
        console.error('Failed to generate export data:', err)
        if (!cancelled) {
          setExportString('')
          dataRef.current = null
        }
      }
    }

    generate()

    return () => {
      cancelled = true
    }
    // exportType is effectively constant per modal instance; trigger is the
    // only value that should cause a regeneration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  const handleDownload = async () => {
    const data = dataRef.current ?? (await getDataRef.current())
    const bytes = await createExportBytes(exportType, data)
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => copyToClipboard(exportString)

  return { exportString, handleDownload, handleCopy, copied }
}
