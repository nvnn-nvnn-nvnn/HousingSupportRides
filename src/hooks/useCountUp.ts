import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

/**
 * Counts a number up from 0 to `target` once it scrolls into view.
 * Ease-out cubic over `duration` ms (Effect 2). Returns a ref to attach to
 * the number element and the current animated value.
 */
export function useCountUp(target: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])

  return { ref, value }
}
