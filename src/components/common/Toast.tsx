import { useCallback, useEffect, useRef } from 'react'
import { CircleCheck } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import type { Toast as ToastType } from '../../types/toast'

/** Duration in seconds before a toast auto-dismisses. */
const DISMISS_SECONDS = 2

interface ToastItemProps {
  /** The toast data to render. */
  toast: ToastType
  /** Callback to remove this toast from the stack. */
  onDismiss: (id: string) => void
}

/**
 * A single success notification card with an animated countdown bar.
 *
 * Behaviour:
 * - Slides in from the right and automatically dismisses after 2 s.
 * - A thin progress bar at the bottom shrinks from full width to zero,
 *   giving the user a visual cue of remaining time.
 * - Hovering pauses both the dismiss timer and the progress animation
 *   so the user can read the message at their leisure.
 * - On mouse leave the full 2-second timer restarts from scratch,
 *   resetting the progress bar animation to match.
 * - On dismiss the toast fades and slides out to the right.
 *
 * All animations are powered by the `motion` library for smooth,
 * interruptible transitions including enter/exit via `AnimatePresence`
 * in the parent `ToastContainer`.
 */
export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Motion value driving the progress bar width (1 → 0). */
  const progress = useMotionValue(1)
  const widthPercent = useTransform(progress, (v) => `${v * 100}%`)
  /** Stores the motion animation control so we can pause/resume. */
  const animControlRef = useRef<ReturnType<typeof animate> | null>(null)

  /** Starts (or restarts) both the dismiss timer and the progress bar animation. */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(
      () => onDismiss(toast.id),
      DISMISS_SECONDS * 1000,
    )

    // Reset and animate the progress bar from full to empty.
    progress.set(1)
    animControlRef.current?.stop()
    animControlRef.current = animate(progress, 0, {
      duration: DISMISS_SECONDS,
      ease: 'linear',
    })
  }, [onDismiss, toast.id, progress])

  /** Cancels any pending auto-dismiss and pauses the progress animation. */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    animControlRef.current?.pause()
  }, [])

  // Start the timer on mount and clean up on unmount.
  useEffect(() => {
    startTimer()
    return () => {
      clearTimer()
      animControlRef.current?.stop()
    }
  }, [startTimer, clearTimer])

  /** Pauses countdown and snaps the progress bar back to full while hovered. */
  const handleMouseEnter = () => {
    clearTimer()
    animControlRef.current?.stop()
    animate(progress, 1, { duration: 0.15, ease: 'easeOut' })
  }

  /** Restarts the full countdown and animation when hover ends. */
  const handleMouseLeave = () => {
    startTimer()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto relative min-w-64 max-w-sm overflow-hidden rounded-lg border border-green-200 bg-white shadow-lg"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <CircleCheck size={18} className="shrink-0 text-green-600" />
        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
      </div>

      {/* Countdown progress bar */}
      <div className="h-1 w-full bg-green-100">
        <motion.div className="h-full bg-green-500" style={{ width: widthPercent }} />
      </div>
    </motion.div>
  )
}
