import { useEffect, useState } from 'react'

interface Options {
  /** How long each slide stays up, in ms. */
  intervalMs?: number
  /**
   * Don't start (and report `ready: false`) until the browser's `load` event.
   * Only for a slideshow holding the page's main image (the hero), so slides
   * 2+ don't compete with it for bandwidth.
   */
  waitForLoad?: boolean
}

/**
 * Index + timer for a crossfading slideshow. Used by the hero and the Support
 * Us section — see how-to/hero-carousel.md, Part 2.
 *
 * - `index` changing restarts the timer (setTimeout, not setInterval), so a
 *   slide picked with a dot gets its full time.
 * - Pauses while `held` (hover) or `playing === false` (a Pause button).
 * - Starts paused, and reports `reduced`, for visitors whose OS asks for
 *   reduced motion.
 */
export function useSlideshow(
  count: number,
  { intervalMs = 6000, waitForLoad = false }: Options = {},
) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [held, setHeld] = useState(false)
  const [ready, setReady] = useState(!waitForLoad)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setPlaying(false)
    }
    if (!waitForLoad) return
    const done = () => setReady(true)
    if (document.readyState === 'complete') done()
    else window.addEventListener('load', done, { once: true })
    return () => window.removeEventListener('load', done)
  }, [waitForLoad])

  useEffect(() => {
    if (count <= 1 || !playing || held || !ready) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearTimeout(id)
  }, [count, playing, held, ready, index, intervalMs])

  const next = () => setIndex((i) => (i + 1) % count)
  const prev = () => setIndex((i) => (i - 1 + count) % count)

  /** For a Pause/Play button: clears the hover hold so Play takes effect at once. */
  const togglePlaying = () => {
    setHeld(false)
    setPlaying((p) => !p)
  }

  return { index, setIndex, next, prev, playing, togglePlaying, held, setHeld, ready, reduced }
}
