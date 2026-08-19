import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

interface FadeUpProps {
  children: ReactNode
  className?: string
  /** Stagger index — multiplies the base delay (0.08s each). */
  index?: number
  /** Explicit delay override in seconds. */
  delay?: number
  as?: 'div' | 'li' | 'section' | 'span'
}

/**
 * Effect 4 — gentle fade-up on scroll into view.
 * Wrap any block to have it rise 24px and fade in once, with an easing
 * curve of [0.22, 1, 0.36, 1]. Honors prefers-reduced-motion via Framer.
 */
function FadeUp({ children, className, index = 0, delay, as = 'div' }: FadeUpProps) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.7,
        delay: delay ?? index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}

export default FadeUp
