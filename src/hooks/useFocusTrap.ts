import { useEffect, type RefObject } from 'react'

interface UseFocusTrapOptions {
  /**
   * CSS selectors for elements to mark `inert` while the overlay is open.
   * Defaults to `['#root']`, which prevents the page content behind the
   * overlay from receiving keyboard focus or pointer events.
   */
  inertSelectors?: string[]
  /**
   * CSS selector for the element within the overlay to focus on open.
   * When omitted, no programmatic focus is applied on open.
   */
  focusOnOpenSelector?: string
}

/**
 * Manages focus trapping and `inert` toggling for portal-based overlays
 * (modals, dropdowns, etc.).
 *
 * On open:
 * - Marks all `inertSelectors` elements as `inert`, preventing the page
 *   content behind the overlay from being keyboard-reachable or
 *   pointer-interactive.
 * - Optionally focuses the first matching `focusOnOpenSelector` element.
 *
 * On close (and cleanup):
 * - Removes `inert` from all previously marked elements.
 * - Restores keyboard focus to `triggerRef.current` if it is non-null,
 *   so the user lands back where they started — a critical WCAG 2.1
 *   requirement (Success Criterion 2.4.3 Focus Order).
 *
 * @param isOpen - Whether the overlay is currently open.
 * @param triggerRef - Ref to the element that opened the overlay. Focus is
 *   returned here on close. Pass `useRef(null)` when focus restoration is not
 *   applicable (e.g. a modal opened from within a dropdown that already manages
 *   its own focus cycle).
 * @param options - Optional configuration for inert selectors and open focus.
 */
export function useFocusTrap(
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  {
    inertSelectors = ['#root'],
    focusOnOpenSelector,
  }: UseFocusTrapOptions = {},
) {
  useEffect(() => {
    // Capture at effect time — the ref value may change before cleanup runs.
    const trigger = triggerRef.current
    const elements = inertSelectors
      .map((sel) => document.querySelector<HTMLElement>(sel))
      .filter((el): el is HTMLElement => el !== null)

    if (isOpen) {
      elements.forEach((el) => { el.inert = true })

      if (focusOnOpenSelector) {
        // A small rAF is needed so the portal's DOM is fully painted before we
        // query it — calling focus() synchronously would find nothing.
        const frame = requestAnimationFrame(() => {
          const target = document.querySelector<HTMLElement>(focusOnOpenSelector)
          target?.focus()
        })
        return () => {
          cancelAnimationFrame(frame)
          elements.forEach((el) => { el.inert = false })
          trigger?.focus()
        }
      }
    } else {
      elements.forEach((el) => { el.inert = false })
      trigger?.focus()
    }

    return () => {
      elements.forEach((el) => { el.inert = false })
      trigger?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
}
