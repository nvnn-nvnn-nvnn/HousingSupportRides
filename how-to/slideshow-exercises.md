# Slideshow Exercises

Practice for building things like the hero carousel elsewhere on the site.
Read [hero-carousel.md](./hero-carousel.md) Part 2 ("How it works") first.
Every exercise builds on ideas from it.

The exercises get harder as you go, and later ones reuse earlier ones.
**Exercise 2 is the foundation:** it turns the hero's private hook into one
the whole site can share.

> **Update 2026-11-12:** Exercise 2 is now done in the real code, because the
> Support Us section needed the same slideshow ([support-section.md](./support-section.md)).
> The shared hook is `src/hooks/useSlideshow.ts`. Read it instead of writing
> it, then start at Exercise 3. The hook also returns `togglePlaying` and
> `reduced`, which the solutions below don't use but could.

Each exercise has:
- **Goal**: what you're building
- **Where**: the files you'll touch
- **You'll practice**: the idea it teaches
- **Hints**: try without them first
- **Done when**: a checklist to test your own work
- **Solution**: collapsed. Open it only after a real attempt, or to compare.

Before each one, run `npm run dev`. After each one, run `npm run build` and make
sure it stays green before you commit.

| # | Exercise | Where on the site | Difficulty |
| --- | --- | --- | --- |
| 1 | Add a photo and change the timing | Homepage hero | ★☆☆ |
| 2 | Turn the hero's hook into a shared one ✅ done | `src/hooks/` | ★★☆ |
| 3 | Rotating testimonials | Homepage, between Our Work and Donate | ★★☆ |
| 4 | Highlights slideshow | `/gallery` | ★★★ |
| 5 | Progress bar + arrow keys | Homepage hero | ★★☆ |
| 6 | Swipe on phones | Any slideshow | ★★☆ |

---

## Exercise 1: Add a photo and change the timing ★☆☆

**Goal:** a sixth hero photo, and slides that stay up for 8 seconds.

**Where:** `public/img/hero/`, `src/lib/content.ts`, `src/components/sections/Hero.tsx`

**You'll practice:** the photo workflow, and finding where a value lives.

**Hints**
- Follow [hero-carousel.md](./hero-carousel.md) Part 1, all four steps.
- The timing is one constant near the top of `Hero.tsx`.
- Do the "cover the sides with your hands" crop check before you run sharp.

**Done when**
- [ ] There are 6 dots.
- [ ] Your photo looks right at 390px wide (the browser's device toolbar), not just on desktop.
- [ ] In the Network tab (F12), a phone width loads `hero-6-1080.jpg`, not `-1920`.
- [ ] Each slide stays up about 8 seconds.
- [ ] Your alt text describes the photo for someone who can't see it.

<details>
<summary>Solution</summary>

```ts
// Hero.tsx
const SLIDE_MS = 8000
```

```ts
// content.ts, at the end of HERO_IMAGES
{ src: '/img/hero/hero-6', alt: '…what is in the photo…' },
```

Plus the two files from the sharp command in Part 1, Step 2.
</details>

---

## Exercise 2: Turn the hero's hook into a shared one ★★☆ ✅ done in the code

*Built 2026-11-12. Compare your answer with `src/hooks/useSlideshow.ts`, or
skip to Exercise 3.*

**Goal:** move `useHeroSlideshow` out of `Hero.tsx` into
`src/hooks/useSlideshow.ts`, so any component can use it. The hero should
behave exactly the same afterwards.

**Where:** new `src/hooks/useSlideshow.ts`; `Hero.tsx`. Look at
`src/hooks/useCountUp.ts` for how this project writes hooks.

**You'll practice:** refactoring without changing behavior, and making a hook
configurable.

**Hints**
- Other slideshows won't be the page's main image, so waiting for `window.load`
  should be an **option**, off by default. The hero turns it on.
- The interval should be an option too, since testimonials need longer than photos.
- Add `next()` and `prev()` helpers. Exercises 5 and 6 need them. Going
  backwards from 0 needs care: `(i - 1 + count) % count`.
- Remove the old hook from `Hero.tsx` once the new one works.

**Done when**
- [ ] `Hero.tsx` no longer defines a hook, and imports `useSlideshow` instead.
- [ ] The hero still advances, pauses on hover, and Pause/Play works.
- [ ] With your OS set to reduce motion, the hero starts paused. (Windows:
      Settings → Accessibility → Visual effects → Animation effects **off**.)
- [ ] `npm run build` passes.

<details>
<summary>Solution</summary>

```ts
// src/hooks/useSlideshow.ts
import { useEffect, useState } from 'react'

interface Options {
  /** How long each slide stays up. */
  intervalMs?: number
  /**
   * Don't start (and report `ready: false`) until the page has loaded.
   * Only for a slideshow holding the page's main image, like the hero.
   */
  waitForLoad?: boolean
}

/**
 * Index + timer for any crossfading slideshow. Pauses on `held` (hover) and
 * `playing === false` (a Pause button); starts paused for reduced motion.
 */
export function useSlideshow(count: number, { intervalMs = 6000, waitForLoad = false }: Options = {}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [held, setHeld] = useState(false)
  const [ready, setReady] = useState(!waitForLoad)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false)
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

  return { index, setIndex, next, prev, playing, setPlaying, held, setHeld, ready }
}
```

```tsx
// Hero.tsx
import { useSlideshow } from '../../hooks/useSlideshow'
// …delete useHeroSlideshow and its now-unused useEffect/useState import…
const { index, setIndex, playing, setPlaying, setHeld, ready: restReady } =
  useSlideshow(count, { intervalMs: SLIDE_MS, waitForLoad: true })
```

Renaming `ready` to `restReady` in the destructure means the rest of the JSX
doesn't change. That's what you want from a refactor.
</details>

---

## Exercise 3: Rotating testimonials ★★☆

**Goal:** a section of short quotes from riders, volunteers or partners that
crossfade one at a time. This is one of the trust signals from the
"look more professional" list.

**Where:**
- `TESTIMONIALS` in `src/lib/content.ts` (new)
- new `src/components/sections/Testimonials.tsx`
- `src/App.tsx`, placed between `<OurWork />` and `<DonateBlock />`

**You'll practice:** crossfading **text**, which has a problem photos don't:
quotes are different lengths.

⚠️ **Real quotes only, with permission.** The site already has hidden sections
because they showed invented content. A first name (or initials) and a role
("Rider since 2025") is enough. Don't use full names of people in recovery
without asking.

**Hints**
- **The height problem:** if you stack the quotes with `absolute`, the box has
  no height. If you only render the current quote, the page jumps every time
  the length changes. The fix is CSS grid: put every quote in the **same grid
  cell** (`[grid-area:1/1]` on each). The cell grows to fit the **tallest**
  quote, and they all overlap in it.
- Reading takes longer than looking at a photo. Use 8–10 seconds.
- Hidden quotes need `aria-hidden`, and `pointer-events-none` so you can't
  select their invisible text.
- Reuse the dots and Pause button markup from `Hero.tsx`, with dark colors
  instead of white, since this sits on a light background.
- Start with one quote. The section should look fine with one (no dots, no
  timer). `useSlideshow` already does nothing when `count <= 1`.

**Done when**
- [ ] Nothing below the section jumps when the quote changes.
- [ ] Works with 1 quote (no controls) and 3 quotes (dots + Pause).
- [ ] Pauses on hover, so someone can finish reading.
- [ ] On a phone, a long quote doesn't overflow.
- [ ] A screen reader reads only the visible quote.

<details>
<summary>Solution</summary>

```ts
// content.ts
export const TESTIMONIALS: { quote: string; name: string; role?: string }[] = [
  { quote: '…real words, with permission…', name: 'M.', role: 'Rider since 2025' },
]
```

```tsx
// src/components/sections/Testimonials.tsx
import { Pause, Play } from 'lucide-react'
import { TESTIMONIALS } from '../../lib/content'
import { useSlideshow } from '../../hooks/useSlideshow'
import { cn } from '../../lib/utils'

function Testimonials() {
  const count = TESTIMONIALS.length
  const { index, setIndex, playing, setPlaying, setHeld } = useSlideshow(count, { intervalMs: 9000 })
  if (count === 0) return null

  return (
    <section
      className="bg-[var(--accent-soft)] py-20"
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label="What people say about Housing Support Rides"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      {/* Every quote in ONE grid cell: the cell sizes to the tallest, so
          switching quotes never moves the content below. */}
      <div className="mx-auto grid max-w-3xl px-5 text-center md:px-16">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            aria-hidden={i !== index}
            className={cn(
              '[grid-area:1/1] transition-opacity duration-700 motion-reduce:transition-none',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <blockquote className="font-serif text-2xl leading-snug md:text-3xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 text-sm text-[var(--muted-foreground)]">
              — {t.name}{t.role ? `, ${t.role}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show quote ${i + 1} of ${count}`}
              aria-current={i === index ? 'true' : undefined}
              className="grid h-7 w-5 place-items-center"
            >
              <span className={cn('block h-2 rounded-full transition-all',
                i === index ? 'w-4 bg-[var(--primary)]' : 'w-2 bg-[var(--primary)]/30')} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setHeld(false); setPlaying((p) => !p) }}
            aria-label={playing ? 'Pause quotes' : 'Play quotes'}
            className="ml-1 grid h-7 w-7 place-items-center rounded-full text-[var(--primary)]"
          >
            {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  )
}

export default Testimonials
```

Note that `if (count === 0) return null` comes **after** the hook call. React
hooks must run on every render, in the same order, so never return early
above a hook.
</details>

---

## Exercise 4: Highlights slideshow on /gallery ★★★

**Goal:** above the Highlights grid on `/gallery`, a large slideshow of the 6
highlight photos.

**Where:**
- `src/pages/gallery.astro`
- new `src/components/HighlightsSlideshow.tsx`

**You'll practice:** the boundary between Astro and React. This is the most
useful lesson on this list.

The difference from the hero: gallery photos live in **`src/assets/`**, not
`public/`. Astro optimizes them at build time (resizing, WebP), but only
`.astro` files can do that. A React component can't import them by a
variable path. So:

1. **In `gallery.astro`** (build time): turn each highlight into a ready-made
   URL with `getImage()`. The page already does this for the lightbox. Read
   the `photos` block at the top.
2. **Pass the plain list** (`{ src, alt }[]`) into a React component as a prop.
3. **Hydrate it with `client:visible`**, not `client:load`. The JavaScript then
   only downloads when the visitor scrolls near it.

**Hints**
- You don't need the hero's two-file `srcset` trick. `getImage({ width: 1600, format: 'webp', quality: 72 })` gives one well-sized file.
- Without `waitForLoad`, slides 2–6 load straight away. `loading="lazy"` on
  them is enough here, because this isn't the page's main image.
- Use a fixed frame like `aspect-[4/3]` with `rounded-xl overflow-hidden`, and
  put the dots **below** the photo instead of over it. Gallery photos have no
  scrim, so white dots would be hard to see.
- ⚠️ Most gallery photos still have placeholder alt text ("Recovery
  Highlights"). Fix the alt text of the 6 highlights first, or the slideshow
  announces the same words six times. That's also an open todo item.

**Done when**
- [ ] View the page source (Ctrl+U): the slideshow's `<img>` URLs point at
      `/_astro/….webp`, not at the original `.jpg`.
- [ ] Network tab: the slideshow's JS only loads once you scroll toward it.
- [ ] Dots, Pause, and hover-pause all work.
- [ ] Clicking a grid photo still opens the lightbox (you didn't break it).

<details>
<summary>Solution</summary>

```astro
---
// gallery.astro, after `const highlights = …`
import HighlightsSlideshow from '../components/HighlightsSlideshow.tsx'

const slides = await Promise.all(
  highlights
    .filter((p) => p.img)
    .map(async (p) => ({
      src: (await getImage({ src: p.img!, width: 1600, format: 'webp', quality: 72 })).src,
      alt: p.alt,
    })),
)
---

<!-- above the Highlights grid -->
<HighlightsSlideshow client:visible slides={slides} />
```

```tsx
// src/components/HighlightsSlideshow.tsx
import { useSlideshow } from '../hooks/useSlideshow'
import { cn } from '../lib/utils'

function HighlightsSlideshow({ slides }: { slides: { src: string; alt: string }[] }) {
  const { index, setIndex, setHeld } = useSlideshow(slides.length)

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Gallery highlights"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      className="mb-12"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
        {slides.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>
      {/* dots + Pause here: copy from Hero.tsx, dark colors, centred below */}
    </div>
  )
}

export default HighlightsSlideshow
```
</details>

---

## Exercise 5: Progress bar + arrow keys for the hero ★★☆

**Goal:** a thin bar along the bottom of the hero that fills over each slide's
6 seconds. Also, the ← → keys change slides while a hero control has focus.

**Where:** `Hero.tsx`, `src/styles/global.css`

**You'll practice:** keeping two clocks in agreement, a CSS animation and a
JavaScript timer.

**Hints**
- A CSS `@keyframes` that goes from `transform: scaleX(0)` to `scaleX(1)`, with
  `origin-left`, plays on a bar over `SLIDE_MS`.
- Giving the bar `key={index}` makes React replace it on each slide, which
  restarts the animation from zero.
- **The trap:** hovering clears the JS timer, and leaving starts a **fresh**
  6 seconds. If the bar merely pauses with `animation-play-state` and then
  resumes from halfway, it reaches the end 3 seconds early. Make the bar
  restart whenever the timer does. What else should go in its `key`?
- Hide the bar when paused, and for reduced motion (`motion-reduce:hidden`).
- Arrow keys: an `onKeyDown` on the section only fires when something inside
  it has focus. Tab onto a dot to test. Use `next`/`prev` from Exercise 2.

**Done when**
- [ ] The bar reaches the end exactly as the slide changes.
- [ ] Hover, then leave: the bar starts over and still lands exactly on the change.
- [ ] No bar when paused or with reduced motion.
- [ ] Tab to a dot, then ← and → change slides.

<details>
<summary>Solution</summary>

```css
/* global.css */
@keyframes slide-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

```tsx
// Hero.tsx, inside the aspect-ratio box, after the scrims
{count > 1 && playing && !held && restReady && (
  <div
    key={index}
    className="absolute inset-x-0 bottom-0 h-1 origin-left bg-white/70 motion-reduce:hidden"
    style={{ animation: `slide-progress ${SLIDE_MS}ms linear forwards` }}
    aria-hidden="true"
  />
)}
```

The bar only renders under the same four conditions as the timer. Hovering
unmounts it, and leaving mounts a new one that starts from zero, exactly when
the fresh timer starts. `key={index}` covers the other case, a slide change.
Matching the conditions is what keeps the two clocks in agreement.

```tsx
// on the <section>
onKeyDown={(e) => {
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}}
```
</details>

---

## Exercise 6: Swipe on phones ★★☆

**Goal:** swiping left or right on any of your slideshows goes to the next or
previous slide. Scrolling the page up and down must still work.

**Where:** any slideshow component. Start with the hero.

**You'll practice:** pointer events, and not stealing gestures from the browser.

**Hints**
- On `pointerdown`, remember `clientX`. On `pointerup`, subtract. More than
  about 50px is a swipe; less is a tap. Only do this for
  `e.pointerType === 'touch'`, so desktop clicks and text selection aren't affected.
- `touch-action: pan-y` on the swipe area tells the browser: "vertical
  scrolling is yours, horizontal movement is mine." Without it, the browser
  may treat a sideways drag as a page gesture.
- When the browser *does* take a gesture (a scroll), you get `pointercancel`
  instead of `pointerup`. Reset there too, or a stale start position triggers
  a swipe on the next tap.
- A swipe should also reset the timer. If you used `setIndex`/`next`, the
  `index` dependency already does that.

**Done when** (test on a real phone, or the device toolbar with touch on)
- [ ] Swipe left → next slide. Swipe right → previous. Wraps at both ends.
- [ ] Scrolling the page up and down over the hero still works.
- [ ] Tapping "Learn More" still works and doesn't count as a swipe.

<details>
<summary>Solution</summary>

```tsx
import { useRef } from 'react'

const startX = useRef<number | null>(null)

<section
  style={{ touchAction: 'pan-y' }}
  onPointerDown={(e) => { if (e.pointerType === 'touch') startX.current = e.clientX }}
  onPointerUp={(e) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
  }}
  onPointerCancel={() => { startX.current = null }}
  // …existing props
>
```

`useRef`, not `useState`: the start position doesn't affect what's on screen,
so storing it shouldn't cause a re-render.
</details>

---

## Ideas once you've done these

- **Partners logo strip** (`Partners.tsx`, currently hidden): a slow, endless
  horizontal scroll of real partner logos. It's a different technique, a CSS
  `@keyframes` translate on a duplicated row, but it has the same pause rule:
  stop on hover, and stop for reduced motion.
- **Journal**: once there are 3+ posts, rotate the featured post card on the
  homepage (`FieldStories.tsx`) with `useSlideshow`.
