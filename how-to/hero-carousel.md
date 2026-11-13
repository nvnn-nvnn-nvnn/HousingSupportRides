# The Hero Carousel

✅ **Built 2026-11-09.** The homepage photo crossfades through several
pictures every 6 seconds, with dots and a Pause button in the top-right corner.

This guide covers three things: how to add or swap a photo, how the code
works, and the mistakes it was built to avoid. When you're ready to build
something similar elsewhere on the site, try the
**[slideshow exercises](./slideshow-exercises.md)**.

Background reading: [images.md](./images.md) explains `public/` vs.
`src/assets/`, which matters below.

## Where everything lives

| What | Where |
| --- | --- |
| The list of photos (order, alt text, crop) | `HERO_IMAGES` in `src/lib/content.ts` |
| The photo files, two sizes each | `public/img/hero/hero-N-1920.jpg` and `hero-N-1080.jpg` |
| The markup (slides, scrims, text, controls) | `src/components/sections/Hero.tsx` |
| The timer, pause and reduced-motion logic | `src/hooks/useSlideshow.ts`, shared with the Support Us section ([support-section.md](./support-section.md)) |

`HERO_IMAGE` (singular) is still exported from `content.ts` and points at the
first photo, for anything that wants just one image.

---

## Part 1: Adding or swapping a photo

### Step 1: Check the crop before anything else ⚠️

The hero frame changes shape with screen size:

| Screen | Frame shape | What gets cut |
| --- | --- | --- |
| Phone (under 640px) | 4:5, tall | **Both sides** of a landscape photo, about 40% of its width |
| Tablet and up | 4:3 | Little or nothing for a 4:3 photo |
| Wide desktop | 4:3, capped at 86% of the window height | Some of the **top and bottom** |

So a good hero photo has its people **in the middle**, with slack on the left
and right. A wide group shot where people stand at the edges will lose them on
phones, and most visitors are on phones.

The quickest check: open the photo, cover the left 20% and right 20% with your
hands. Is everyone important still visible? If not, pick another photo, or
plan to set a custom `focal` (Step 3).

Every photo also needs **permission** from the people in it, specifically for
the front page of a recovery organization, not just the gallery.

### Step 2: Make the two file sizes

Run this from the project root. Change the input path and the number:

```bash
node -e "const s=require('sharp');for(const w of [1920,1080])s('src/assets/img/gallery/IMG_XXXX.jpg').rotate().resize({width:w}).jpeg({quality:72,mozjpeg:true}).toFile('public/img/hero/hero-6-'+w+'.jpg')"
```

What each part does:
- `.rotate()` applies the phone's orientation flag, so portrait photos aren't sideways.
- `1920` is for laptops and desktops, `1080` is for phones.
- `quality:72` with `mozjpeg` keeps a 1080 file around 100–200 KB with no visible loss.

The files go in `public/` (not `src/assets/`) because the hero is a React
component and refers to them by plain URL.

### Step 3: Add it to the list

In `src/lib/content.ts`:

```ts
export const HERO_IMAGES: { src: string; alt: string; focal?: string }[] = [
  { src: '/img/hero/hero-1', alt: 'A large group of …' },
  // …
  { src: '/img/hero/hero-6', alt: 'Describe what a blind visitor should know about this photo' },
]
```

- **`src` is a base path.** No size, no `.jpg`, because the hero adds `-1920.jpg` / `-1080.jpg` itself.
- **Order matters.** The list order is the slide order, and **the first entry
  is the one that loads first**. Put your strongest, lightest photo there.
- **`focal`** is optional. It's a Tailwind `object-position` class, for when the
  subject isn't in the upper middle:
  ```ts
  { src: '/img/hero/hero-6', alt: '…', focal: 'object-[50%_15%] sm:object-center' },
  ```
  The first value is left↔right and the second is top↕bottom. `50% 15%` means
  "keep the horizontal centre, stay near the top." Without `focal`, the default
  is `object-[50%_32%] sm:object-center`.

### Step 4: Check it

1. Run `npm run dev` and open the homepage.
2. Use your browser's device toolbar (F12 → the phone icon) at **390px wide**.
   Wait for your photo to come round, or click its dot.
3. Check desktop width too.

To **remove** a photo, delete its entry from the list, then delete its two files.

---

## Part 2: How it works

The whole carousel is about 100 lines in `Hero.tsx`. There are five ideas.

### 1. Every slide is stacked in the same box

All the `<img>`s sit on top of each other with `absolute inset-0`, inside the
box that already has the aspect ratio. Only the current one has `opacity-100`.
The others have `opacity-0`. A CSS transition does the fade:

```tsx
className={cn(
  'absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out',
  img.focal ?? DEFAULT_FOCAL,
  i === index ? 'opacity-100' : 'opacity-0',
)}
```

When `index` changes, one photo fades out while the next fades in, in the same
place. That's a crossfade, and it's just CSS.

> **Why not Framer Motion's `AnimatePresence`?** The original plan used it.
> But `AnimatePresence` only *mounts* the incoming slide when it's time to show
> it, so the browser only starts downloading the photo then. On a slow
> connection the slide would fade in **black**. Stacked images are already
> downloaded and waiting.

### 2. A small hook owns the timer

The hook lives in `src/hooks/useSlideshow.ts`. It started inside `Hero.tsx` and moved out on 2026-11-12, when the Support Us section became the second slideshow. The hero calls it like this:

```tsx
const { index, setIndex, playing, togglePlaying, setHeld, ready: restReady } =
  useSlideshow(count, { intervalMs: SLIDE_MS, waitForLoad: true })
```

Inside, the core is one effect:

```tsx
const [index, setIndex] = useState(0)        // which photo is showing
const [playing, setPlaying] = useState(true) // Pause/Play button
const [held, setHeld] = useState(false)      // mouse is over the slideshow
const [ready, setReady] = useState(!waitForLoad) // page finished loading (hero only)
// …
useEffect(() => {
  if (count <= 1 || !playing || held || !ready) return
  const id = setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs)
  return () => clearTimeout(id)
}, [count, playing, held, ready, index, intervalMs])
```

Read the effect as one sentence: *"If there's more than one photo, and we're
playing, and nobody's hovering, and the page has loaded, then in 6 seconds go
to the next photo."*

- **`% count`** wraps from the last photo back to the first.
- **`setTimeout`, not `setInterval`**, with `index` in the dependency list.
  Each slide change re-runs the effect and starts a fresh 6 seconds. So when
  someone clicks a dot, their chosen photo gets its full time instead of
  whatever was left on the old timer.
- **The cleanup** (`return () => clearTimeout(id)`) cancels the pending timer
  whenever anything changes, such as pausing or hovering. Forget it and you get
  double-speed slides.

### 3. The first photo loads first

The hero photo is the biggest thing on the page, and Google measures how fast
it appears (that measurement is called LCP). So:

- Slide 1 gets `loading="eager"` and `fetchPriority="high"`.
- Slides 2–5 **aren't rendered at all** until the browser's `load` event fires
  (`restReady`), so they never compete with slide 1 for bandwidth.
- `srcSet` + `sizes="100vw"` let the browser pick the 1080 file on phones and
  the 1920 file on bigger screens.

### 4. Order inside the box matters

```
<motion.div aspect-ratio box>
  slides            ← first, at the bottom of the stack
  flat tint         ← bg-black/10
  gradient scrim    ← darkens the bottom so white text is readable
  text
  controls          ← last, on top
```

If the slides came **after** the scrims, each new photo would fade in on top
of the darkening, and the headline would lose its background every 6 seconds.

### 5. Visitors can stop it

An auto-advancing slideshow that can't be paused fails accessibility rules
(WCAG 2.2.2: anything moving for more than 5 seconds needs a pause). So:

| Who | What happens |
| --- | --- |
| Everyone | **Pause/Play button** in the top-right corner |
| Mouse users | Hovering the hero pauses it (`held`) |
| People whose OS asks for reduced motion | Starts paused, and fades are instant (`motion-reduce:transition-none`) |
| Screen reader users | Hidden slides are `aria-hidden`, so only the visible photo is announced. The section is labelled as a carousel. |

**A detail that was a real bug:** clicking Play happens *while the mouse is over
the hero*, so `held` is still true and nothing would advance. The Play button
calls `setHeld(false)` before toggling, so it always takes effect.

---

## Gotchas

| Symptom | Cause | Fix |
| --- | --- | --- |
| Homepage is black, nothing animates, in dev only | The dev server's dependency cache is stale. The browser console shows `504 (Outdated Optimize Dep)` | Stop `npm run dev` and start it again |
| A photo is broken | Only one of its two sizes exists, or `src` includes `.jpg` | Check both `-1920.jpg` and `-1080.jpg` exist, and `src` is the base path |
| Faces cut off on phones | Subject too far left/right, or low in the frame | Pick another photo, or add a `focal` |
| Slides advance twice as fast | An edited timer effect lost its cleanup | Keep `return () => clearTimeout(id)` |
| Headline unreadable on one photo | That photo is very bright at the bottom | Tune the **gradient** scrim, not the flat tint (the flat tint dulls every photo) |
| Only the first photo ever appears | `restReady` never turned true, or the hydration failed | Check the console for errors; see the first row |

## Alternative: swipeable slides

If you ever want drag/swipe with momentum, Embla Carousel is a good library
(`embla-carousel-react` + `embla-carousel-autoplay`). Don't add it for a plain
crossfade. A simple swipe-to-advance is a short exercise, see
[slideshow-exercises.md](./slideshow-exercises.md) Exercise 6.
