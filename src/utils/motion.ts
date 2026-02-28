import type { Variants, Transition } from 'motion/react'

/**
 * Centralised motion primitives for the application.
 *
 * All animation code should pull from these exports rather than defining
 * ad-hoc values so that timing, easing, and reduced-motion behaviour remain
 * consistent. The `<MotionConfig reducedMotion="user">` wrapper in the root
 * layout automatically disables or scales down all animations for users who
 * have enabled the OS "reduce motion" accessibility setting — no per-component
 * logic is required.
 *
 * Naming conventions:
 *  - `duration.*`   — raw second values.
 *  - `ease.*`       — cubic-bezier arrays.
 *  - `transitions.*`— `Transition` objects ready to pass to the `transition` prop.
 *  - `*Variants`    — `Variants` maps with `initial`, `animate`, `exit` keys.
 */

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

/** Raw duration values in seconds. */
export const duration = {
  fast: 0.12,
  normal: 0.18,
  slow: 0.28,
} as const

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

/**
 * Cubic-bezier curves for common motion patterns.
 * Values chosen to feel natural at short durations (< 300 ms).
 */
export const ease = {
  /** Fast start, gentle settle — good for things entering the screen. */
  enter: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Gentle start, fast exit — good for things leaving the screen. */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  /** Balanced curve for state-change transitions. */
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const

// ---------------------------------------------------------------------------
// Transition presets
// ---------------------------------------------------------------------------

/**
 * Ready-made `Transition` objects for common scenarios.
 * Pass these directly to the `transition` prop on a `motion.*` element.
 */
export const transitions: Record<string, Transition> = {
  /** Semi-transparent overlay fading in behind a modal. */
  backdrop: { duration: duration.normal, ease: 'easeOut' },
  /** Modal panel appearing with a gentle scale-up. */
  modal: { duration: duration.normal, ease: ease.enter },
  /** Library / combat list items entering or leaving. */
  item: { duration: duration.fast, ease: ease.enter },
  /** Route-level page fade. */
  route: { duration: duration.normal, ease: ease.enter },
  /** Inline UI element swapping (e.g. combat bar button group). */
  swap: { duration: duration.fast, ease: ease.standard },
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

/**
 * Pure opacity fade — suitable for overlays, empty-state text, and any
 * element where spatial movement would feel distracting.
 */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Slides the element up 8 px while fading in; exits by fading out with a
 * 4 px upward nudge. Use for list items and page content entering.
 */
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

/**
 * Slight scale-up (0.97 → 1) combined with a fade. Designed for modal
 * panels so they feel like they lift off the page rather than just appearing.
 */
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
}

/**
 * Staggered container variants.
 *
 * Apply to a parent `motion.*` element alongside `AnimatePresence` so that
 * child list items animate in cascade rather than all at once. Each child
 * should use `slideUpVariants` (or similar) and will inherit the stagger
 * delay automatically.
 */
export const staggeredContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
  exit: {},
}

// ---------------------------------------------------------------------------
// Animation threshold
// ---------------------------------------------------------------------------

/**
 * Maximum number of list items that receive per-item enter/exit animations.
 *
 * Framer Motion's layout recalculation runs on the main thread and scales
 * linearly with the number of animated nodes. Above this count the cost
 * becomes perceptible on low-end devices (~50 items = ~one visible screen).
 * Lists exceeding the threshold should render plain HTML elements instead of
 * `motion.*` nodes so animation work is eliminated entirely.
 */
export const ANIMATION_THRESHOLD = 50

/**
 * Returns `true` when per-item enter/exit animations should be applied to a
 * list containing `count` items.
 *
 * Use at the call-site to conditionally switch between an animated
 * (`AnimatePresence` + `motion.*`) and a plain-element rendering path.
 *
 * @example
 * const animateItems = shouldAnimate(combatants.length)
 */
export function shouldAnimate(count: number): boolean {
  return count <= ANIMATION_THRESHOLD
}
