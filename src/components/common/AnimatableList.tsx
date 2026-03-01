import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { slideUpVariants, transitions } from '../../utils/motion'

interface AnimatableListProps {
  /** When true, wraps children in AnimatePresence so items animate in/out. */
  animate: boolean
  children: ReactNode
}

/**
 * Conditionally wraps children in `AnimatePresence` based on the `animate`
 * flag. Use this to consolidate the animated/static dual-render pattern common
 * in list components that only animate after the initial data load.
 */
export function AnimatableList({ animate, children }: AnimatableListProps) {
  if (animate) {
    return <AnimatePresence initial={false}>{children}</AnimatePresence>
  }
  return <>{children}</>
}

interface AnimatableItemProps {
  /** When true, renders a motion.div with slide-up enter/exit animation. */
  animate: boolean
  className?: string
  children: ReactNode
}

/**
 * A list row wrapper that renders either a `motion.div` with the shared
 * slide-up animation variants or a plain `div`, depending on the `animate`
 * flag. Pair with `AnimatableList` to fully eliminate the duplicated
 * animated/static JSX paths in list components.
 */
export function AnimatableItem({
  animate,
  className,
  children,
}: AnimatableItemProps) {
  if (animate) {
    return (
      <motion.div
        variants={slideUpVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.item}
        className={className}
      >
        {children}
      </motion.div>
    )
  }
  return <div className={className}>{children}</div>
}
