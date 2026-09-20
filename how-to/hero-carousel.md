# Building a Looping Hero Carousel

Goal: the hero photo cycles through several images automatically, instead of
showing one static shot.

Read [images.md](./images.md) first — where the files live affects this.

## Which library? (short answer: none)

| Option | Verdict |
| --- | --- |
| **Framer Motion (`motion`)** ← *use this* | **Already installed** and already used in `Hero.tsx`. A crossfade loop is ~15 lines. Zero new dependencies. |
| **Embla Carousel** | Reach for this only if you want *swipeable/draggable* slides with arrows and dots. Great library, but it's a new dep for something we don't need yet. |
| **Swiper** | Heavy. Overkill here. |
| **CSS scroll-snap** | Lovely for a *manual* swipe strip (see the gallery guide), but can't auto-advance without JS anyway. |

Since the hero just needs to *loop on its own*, Framer Motion wins — it's
already there, and `AnimatePresence` handles the crossfade for free.

## Step 1 — Decide the aspect ratio first ⚠️

This trips people up. Our hero currently locks the container to `4 / 3` because
that's `cover.jpg`'s exact ratio — that's *why* the whole photo shows with no
cropping and no black bars.

**The moment you add a second photo with a different shape, that breaks.** You
get one of two outcomes:

- **`object-cover`** → fills the frame, but crops the edges off any photo whose
  ratio ≠ the container's. People at the edges of a group shot get cut.
- **`object-contain`** → shows every photo whole, but letterboxes anything that
  doesn't match, which is what we rejected earlier.

So pick one **before** you build:

1. **Best-looking option:** crop/export all hero photos to the *same* aspect
   ratio (4:3 to match what's there) before adding them. Then `object-cover` is
   lossless and everything just works.
2. **Pragmatic option:** keep `object-cover` and accept some cropping — but
   choose photos where the subject is centered, and check each one on mobile.

Don't skip this. It's the difference between a carousel that looks intentional
and one that beheads people in group photos.

## Step 2 — Add the image list

In `src/lib/content.ts`, replace the single `HERO_IMAGE` with a list:

```ts
/**
 * Hero carousel. Each entry cycles automatically.
 * ⚠️ Export all of these at the SAME aspect ratio (4:3) or they'll be cropped.
 * Empty list or single entry = no animation, just a static image.
 */
export const HERO_IMAGES: { src: string; alt: string }[] = [
  {
    src: '/img/cover.jpg',
    alt: 'A large group of clients, volunteers, and staff gathered outdoors',
  },
  // { src: '/img/hero-2.jpg', alt: '…' },
  // { src: '/img/hero-3.jpg', alt: '…' },
]
```

Keep `HERO_IMAGE` exported too (pointing at `HERO_IMAGES[0]?.src ?? ''`) if you
don't want to update every consumer at once.

## Step 3 — The carousel itself

In `src/components/sections/Hero.tsx`. The existing structure stays — you're
only swapping the single `<MediaPlaceholder>` for a cycling one.

Add the state and the timer:

```tsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HERO_IMAGES } from '../../lib/content'

const SLIDE_MS = 6000

function useHeroSlideshow(count: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // Nothing to cycle through
    if (count <= 1) return

    // Respect people who've asked for less motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS)
    return () => clearInterval(id)
  }, [count])

  return index
}
```

Then render the crossfade where the old image was:

```tsx
const index = useHeroSlideshow(HERO_IMAGES.length)
const current = HERO_IMAGES[index]

// …inside the aspect-ratio box that already exists:
<AnimatePresence mode="sync">
  <motion.div
    key={index}
    className="absolute inset-0"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2, ease: 'easeInOut' }}
  >
    <MediaPlaceholder
      src={current?.src}
      alt={current?.alt ?? ''}
      eager={index === 0}
      chip={false}
    />
  </motion.div>
</AnimatePresence>
```

Three details that matter:

- **`key={index}`** is what makes `AnimatePresence` treat each slide as a new
  element. Without it, nothing animates.
- **`mode="sync"`** (not `"wait"`) so the outgoing and incoming images overlap —
  that's what produces a crossfade instead of a fade-to-blank-and-back.
- **`absolute inset-0`** so both slides stack in the same box during the
  transition. The parent already has the aspect ratio and `position: relative`.

## Step 4 — Don't tank your LCP

The hero is your Largest Contentful Paint element, so this matters:

- **First slide eager, rest lazy** — that's the `eager={index === 0}` above.
- **Preload the first image** in `BaseLayout.astro` if you want to be thorough:
  ```astro
  <link rel="preload" as="image" href="/img/cover.jpg" />
  ```
- **Don't ship 2 MB files.** See [images.md](./images.md) — a carousel of
  unoptimized photos is several megabytes of hero. Optimize before you loop.

## Optional polish

**Pause on hover** — add `onMouseEnter`/`onMouseLeave` to set a `paused` flag
the interval checks.

**Dots** — render one button per image; clicking sets `index` directly. Give
each an `aria-label` ("Show photo 2 of 4"). Only worth adding once you have 3+
photos.

**Accessibility note:** an auto-advancing carousel that can't be paused is a
WCAG issue if it runs more than 5 seconds. The `prefers-reduced-motion` check
above covers the main case; adding pause-on-hover covers the rest.

## Alternative: swipeable slides with Embla

If you decide you want drag/swipe:

```bash
npm install embla-carousel-react embla-carousel-autoplay
```

```tsx
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })])

<div className="overflow-hidden" ref={emblaRef}>
  <div className="flex">
    {HERO_IMAGES.map((img) => (
      <div className="min-w-0 flex-[0_0_100%]" key={img.src}>…</div>
    ))}
  </div>
</div>
```

It's a good library. Just don't add it for a plain crossfade — Framer Motion is
already paid for.
