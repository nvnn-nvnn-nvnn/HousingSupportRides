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

## Step 1 — Understand the two crops first ⚠️

**Updated 2026-09-22.** The hero no longer has one aspect ratio. It has two,
plus a shifted focal point on mobile:

```tsx
className="relative aspect-[4/5] max-h-[min(86vh,900px)] w-full sm:aspect-[4/3]"
// and on the image itself:
className="object-[50%_32%] sm:object-center"
```

So every photo you add has to survive **three** things, not one:

| Constraint | What it means for your photo |
| --- | --- |
| `4:5` below `sm:` (640px) | A tall, narrow crop. Wide group shots lose both edges. |
| `4:3` at `sm:` and up | The familiar landscape crop. |
| `object-[50%_32%]` on mobile | The crop is biased **toward the top third**, because centring beheaded people in the 4:5 frame. A photo with its subject low in the frame will have them cut off on phones. |

`object-cover` is doing the cropping in all cases — `object-contain` would
letterbox, which is what we rejected.

Practically, that means:

1. **Best-looking option:** choose photos where the subject sits in the **upper
   middle** and has slack on the left and right. Those survive both crops. Then
   you can leave `object-position` alone.
2. **Pragmatic option:** accept that each photo may need its **own**
   `object-position`. Step 2 makes that a per-image field for exactly this
   reason — a group shot and a portrait rarely want the same focal point.

⚠️ **Check every photo at 390px wide before committing it.** The 4:5 mobile
crop is where faces get cut, and it's the crop most of your visitors see. The
desktop view will look fine and tell you nothing.

## Step 2 — Add the image list

In `src/lib/content.ts`, replace the single `HERO_IMAGE` with a list:

```ts
/**
 * Hero carousel. Each entry cycles automatically.
 * ⚠️ Export all of these at the SAME aspect ratio (4:3) or they'll be cropped.
 * Empty list or single entry = no animation, just a static image.
 */
export const HERO_IMAGES: { src: string; alt: string; focal?: string }[] = [
  {
    src: '/img/cover.jpg',
    alt: 'A large group of clients, volunteers, and staff gathered outdoors',
    // Tailwind object-position classes. Omit to inherit the hero default
    // (`object-[50%_32%] sm:object-center`). Override per photo when the
    // subject isn't in the upper middle — see Step 1.
    focal: 'object-[50%_32%] sm:object-center',
  },
  // { src: '/img/hero-2.jpg', alt: '…', focal: 'object-[50%_20%] sm:object-center' },
  // { src: '/img/hero-3.jpg', alt: '…' },
]
```

Keep `HERO_IMAGE` exported too (pointing at `HERO_IMAGES[0]?.src ?? ''`) if you
don't want to update every consumer at once.

## Step 3 — The carousel itself

In `src/components/sections/Hero.tsx`. The existing structure stays — you're
only swapping the single `<MediaPlaceholder>` for a cycling one.

### ⚠️ What the 2026-09-22 hero rebuild changed here

Three things about the current file that the code below has to respect:

1. **There are two scrim layers above the image**, not one — a flat
   `bg-black/20` and a gradient. The cycling images must go **where the single
   `<MediaPlaceholder>` is now: first child, underneath both scrims.** Append
   them after the scrims instead and each new slide fades in *over* the
   darkening, so the text loses its background every six seconds.
2. **`MediaPlaceholder` takes a `className`**, and the hero uses it for
   `object-[50%_32%] sm:object-center`. Your carousel has to pass that through
   per slide — see the `focal` field in Step 2 — or every photo reverts to a
   centre crop on mobile and the faces go.
3. **The text block is shorter now** (headline, tagline, one button). There's
   more visible photo than there used to be, so a badly cropped slide is more
   obvious, not less.

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
      className={current?.focal ?? 'object-[50%_32%] sm:object-center'}
      eager={index === 0}
      chip={false}
    />
  </motion.div>
</AnimatePresence>
```

Four details that matter:

- **`key={index}`** is what makes `AnimatePresence` treat each slide as a new
  element. Without it, nothing animates.
- **`mode="sync"`** (not `"wait"`) so the outgoing and incoming images overlap —
  that's what produces a crossfade instead of a fade-to-blank-and-back.
- **`absolute inset-0`** so both slides stack in the same box during the
  transition. The parent already has the aspect ratio and `position: relative`.
- **The `className` fallback** repeats the hero's own default, so a slide with
  no `focal` still gets the mobile crop correction rather than silently
  reverting to `object-center`. `MediaPlaceholder` merges it with
  `tailwind-merge`, so a per-image value cleanly overrides the default.

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
