# Building the Gallery Page

Goal: `/gallery` split into **Highlights** (recent) and **Archive** (older),
each photo with a blurb, click-to-enlarge lightbox, scroll-reveal, responsive.

Read [images.md](./images.md) first.

## The mental model

Three separate concerns. Build them in this order — each works on its own, so
you can stop after any step and still have something shippable.

1. **Data** — one array describing every photo (the only thing you edit later)
2. **Layout** — grid, split into two sections
3. **Behavior** — lightbox + scroll-reveal (progressive enhancement; the page
   works fine without them)

Keeping these separate is the whole trick. If you find yourself writing photo
captions inside JSX, back up.

### Adding a photo once this is built

Worth reading now, because it's the thing you'll actually do. Only the first
two are yours:

**You:**

1. Drop the file into `src/assets/img/gallery/`.
2. Add an entry to `GALLERY_IMAGES` in `src/lib/content.ts` — filename, alt,
   title, blurb, date.

**Automatic:**

3. `gallery.astro` globs the folder, sorts by date, resolves each `file` to an
   optimized image, and generates the big lightbox render.
4. `GalleryGrid` slices into Highlights/Archive and renders the tiles.

Note what's *not* on that list: you never `import` a photo individually. The
glob picks up anything in the folder. And the annotating (step 2) happens
*before* the resolving (step 3) — `content.ts` is the input, not the output.


---

## Step 1 — Model the data

In `src/lib/content.ts`. The existing `GALLERY_IMAGES` needs three new fields:

```ts
export type GalleryPhoto = {
  /** Filename only, e.g. 'picnic-2026.jpg'. Resolved via import.meta.glob. */
  file: string
  /** Required. Describes the image for screen readers. */
  alt: string
  /** Short heading shown under the photo. */
  title: string
  /** The paragraph under the title. Shown in the lightbox too. */
  blurb: string
  /** ISO date 'YYYY-MM-DD'. Drives ordering + the Highlights/Archive split. */
  date: string
}

export const GALLERY_IMAGES: GalleryPhoto[] = [
  {
    file: 'cover.jpg',
    alt: 'A large group of clients, volunteers, and staff gathered outdoors',
    title: 'Recovery milestone celebration',
    blurb: 'Neighbors, volunteers, and staff gathered to mark recovery milestones together.',
    date: '2026-08-15',
  },
]

/** How many of the most recent photos count as "Highlights". */
export const HIGHLIGHT_COUNT = 6
```

**Why `date` instead of a manual `section: 'highlight' | 'archive'` flag?**
Because you'd have to remember to demote old photos by hand. With a date, you
sort once and slice — adding a new photo automatically pushes the oldest one
into the archive. Less for you to maintain.

**Why `file` instead of a full `/img/...` path?** So Astro can optimize it —
see the glob step below. If you'd rather keep using `public/img/` and skip
optimization for now, store the full path and skip Step 2.

---

## Step 2 — Resolve filenames to optimized images

Put your photos in `src/assets/img/gallery/`.

The problem: you can't `import` a path built from a variable (see
[images.md](./images.md#the-gotcha-youll-hit-first)). The fix is
`import.meta.glob`, which Vite resolves at build time.

This is what `src/pages/gallery.astro` actually does:

```astro
---
import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { GALLERY_IMAGES, HIGHLIGHT_COUNT } from '../lib/content'

// Eagerly pull in every gallery image as an optimizable module
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/gallery/*.{jpg,jpeg,png,webp}',
  { eager: true },
)

// Newest first
const sorted = [...GALLERY_IMAGES].sort((a, b) => b.date.localeCompare(a.date))

const photos = await Promise.all(
  sorted.map(async (photo) => {
    const img = files[`../assets/img/gallery/${photo.file}`]?.default ?? null
    // A larger render for the lightbox, so zooming in stays sharp.
    const full = img
      ? await getImage({ src: img, width: 2000, format: 'webp', quality: 72 })
      : null
    return { ...photo, img, fullSrc: full?.src ?? '' }
  }),
)

const highlights = photos.slice(0, HIGHLIGHT_COUNT)
const archive = photos.slice(HIGHLIGHT_COUNT)
---
```

That block is doing more than it looks. The rest of this step unpacks it.

### Three things with confusingly similar names

The single biggest source of confusion here is that `photo`, `files[key]`, and
`img` sound interchangeable and are not:

| In the code | What it actually is |
| --- | --- |
| `photo` | The **data entry** you wrote in `content.ts` — words only (`file`, `alt`, `title`, `blurb`, `date`). No module involved. |
| `files['../assets/img/gallery/x.jpg']` | The **module** — the box that `.default` comes out of. Shaped `{ default: … }`. |
| `img` (`= files[key].default`) | The **metadata** — `{ src, width, height, format }`. One level *past* the module. |

So line 25 does all three in one hop: take `photo`'s filename, find the module,
unwrap it to metadata.

```js
const img = files[`../assets/img/gallery/${photo.file}`]?.default ?? null
//          └──────────── the module ─────────────────┘ └ unwrap ┘
```

### The image bytes are never in JavaScript

`img` is not a picture. It's a small plain object *describing* one:

```js
img = {
  src: '/_astro/cover.DH6Y3QLa.webp',
  width: 4080,
  height: 3072,
  format: 'jpg',
}
```

The actual file stays on disk. All you ever hold is this metadata card — a
pointer plus dimensions — which is why passing `img` around costs nothing.

**Why `<Image>` wants the metadata specifically:** knowing `4080×3072` up front
is how Astro picks `srcset` sizes and stamps `width`/`height` on the tag so the
page doesn't jump while loading. A bare URL string can't do that — which is
exactly why these files live in `src/` and not `public/`.

### What `...photo` does

`...` is the **spread operator**: *copy every key of `photo` into this new
object.* Given

```js
photo = { file: 'picnic.jpg', alt: '…', title: '…', blurb: '…', date: '2026-08-15' }
```

then `return { ...photo, img, fullSrc }` builds

```js
{
  file: 'picnic.jpg', alt: '…', title: '…', blurb: '…', date: '2026-08-15',  // from ...photo
  img:     { src: '/_astro/…webp', width: 4080, height: 3072 },              // new
  fullSrc: '/_astro/…2000w.webp',                                            // new
}
```

It's pure shorthand — identical to writing `file: photo.file, alt: photo.alt, …`
by hand. The payoff is that adding a sixth field to `GalleryPhoto` later won't
require editing this line.

**This is the moment the two halves combine.** That returned object is exactly
the `GalleryItem` type in `GalleryGrid.astro`:

```ts
export type GalleryItem = GalleryPhoto & { img: ImageMetadata | null; fullSrc: string }
//                        └ the ...photo ┘  └────────── the two new keys ──────────┘
```

The `&` in the type is the same idea as the spread in the value.

### Why `async` and `Promise.all`

`getImage()` genuinely resizes a file — that's slow, so it returns a Promise.
Anything that `await`s must be `async`, which makes the callback `async`, which
means `.map()` returns an array of *Promises*, not objects.

`Promise.all` waits for all of them and hands back the plain array. Because they
were all started before any was awaited, the 33 images are processed **in
parallel** rather than one after another.

This all happens at build time. Visitors never wait for it.

### Why sort, then slice

`localeCompare` on ISO dates works because `YYYY-MM-DD` sorts correctly as plain
text — no `Date` parsing needed. Sort once, then slice: adding a new photo
automatically pushes the oldest out of Highlights and into Archive. Nothing to
maintain by hand.

⚠️ Right now every entry in `GALLERY_IMAGES` shares one date, so the sort is a
no-op and the Highlights/Archive split is effectively arbitrary. Real per-photo
dates are on the to-do list.

### Smaller things worth knowing

- **The glob pattern must be a literal string.** It can't be a variable either —
  Vite statically analyzes it. That's the whole point.
- **`eager: true`** imports everything up front. Fine for a gallery; with
  hundreds of photos, drop it and you get lazy `() => Promise` functions.
- **`?? null`** is what you get for a filename that matches no file. Keep it —
  it's how a typo shows up as a visible tile instead of a crashed build.

---

## Step 3 — The grid

Build one reusable chunk and use it twice. In Astro you can just define a local
component in `src/components/GalleryGrid.astro`:

```astro
---
import type { ImageMetadata } from 'astro'
import { Image } from 'astro:assets'
import type { GalleryPhoto } from '../lib/content'

/** A gallery entry once its file has been resolved to a real image. */
export type GalleryItem = GalleryPhoto & {
  /** null when the filename in content.ts doesn't match a file on disk. */
  img: ImageMetadata | null
  /** Larger optimized URL, used by the lightbox so zooming stays sharp. */
  fullSrc: string
}

interface Props {
  photos: GalleryItem[]
  /** Archive uses tighter tiles than Highlights. */
  dense?: boolean
}

const { photos, dense = false } = Astro.props
---

<ul
  class:list={[
    'grid gap-5',
    dense
      ? 'grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  ]}
>
  {photos.map((photo) => (
    <li class="reveal overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <button
        type="button"
        class="group block w-full cursor-zoom-in text-left"
        data-lightbox
        data-src={photo.fullSrc}
        data-alt={photo.alt}
      >
        <div class="aspect-[4/3] overflow-hidden">
          {photo.img ? (
            <Image
              src={photo.img}
              alt={photo.alt}
              width={800}
              height={600}
              widths={[400, 800]}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div class="flex h-full items-center justify-center bg-[var(--primary)] p-3 text-center text-xs text-white/75">
              Missing file: {photo.file}
            </div>
          )}
        </div>
        <div class="p-4">
          <h3 class="font-sans font-semibold text-[var(--foreground)]">{photo.title}</h3>
          <p class="mt-1 text-sm text-[var(--muted-foreground)]">{photo.blurb}</p>
        </div>
      </button>
    </li>
  ))}
</ul>
```

Notes:

- **The grid takes `GalleryItem[]`, not `GalleryPhoto[]`.** All the resolving
  already happened in Step 2, so this component never touches `import.meta.glob`
  — it just renders what it's handed. That's the split worth keeping: the page
  does the work, the grid does the markup.
- **`width`/`height` are set on purpose.** Given only `widths`, Astro renders
  the plain `src` fallback at the source's *full* size — a 4000px,
  multi-megabyte file. Pinning `width` made one tile go from 3000 KB to 164 KB.
  See [images.md](./images.md#two-sizing-traps-that-cost-real-megabytes).
- **`class:list`** is Astro's built-in helper for conditional classes — cleaner
  than string concatenation. (It's the `.astro` equivalent of the `cn()` helper
  we use in React files.)
- **The missing-file branch** renders a visible "Missing file: …" tile rather
  than failing. You'll spot a typo instantly instead of getting a blank square.
- **`data-*` attributes** carry everything the lightbox needs — note `data-src`
  points at `fullSrc`, the big 2000px render, not the 800px tile. That's the
  handoff between markup and behavior, no JS framework required.
- **`class="reveal"`** is the hook for scroll-reveal in Step 5.

Then in `gallery.astro`:

```astro
<PageHeader eyebrow="Gallery" title="Moments From the Work" lead="…" />

<section class="mx-auto max-w-[1200px] px-5 py-16 md:px-16">
  <h2 class="font-serif text-2xl font-semibold">Highlights</h2>
  <div class="mt-6">
    <GalleryGrid photos={highlights} />
  </div>

  {archive.length > 0 && (
    <>
      <h2 class="mt-20 font-serif text-2xl font-semibold">Archive</h2>
      <p class="mt-2 text-[var(--muted-foreground)]">Earlier moments.</p>
      <div class="mt-6">
        <GalleryGrid photos={archive} dense />
      </div>
    </>
  )}
</section>
```

The `archive.length > 0 &&` guard means the Archive heading simply doesn't
appear until you actually have more than `HIGHLIGHT_COUNT` photos.

---

## Step 4 — The lightbox

Use the native `<dialog>` element. You get Escape-to-close, focus trapping, and
inert-background for free — all the things people get wrong hand-rolling this.

```astro
<dialog
  id="lightbox"
  class="max-h-[90vh] max-w-[92vw] rounded-xl bg-[var(--background)] p-0 backdrop:bg-black/80"
>
  <figure class="m-0">
    <img id="lb-img" src="" alt="" class="max-h-[70vh] w-auto" />
    <figcaption class="p-5">
      <h3 id="lb-title" class="font-serif text-xl font-semibold"></h3>
      <p id="lb-blurb" class="mt-2 text-[var(--muted-foreground)]"></p>
    </figcaption>
  </figure>
  <button
    id="lb-close"
    type="button"
    aria-label="Close"
    class="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white"
  >Close</button>
</dialog>

<script>
  const dialog = document.querySelector<HTMLDialogElement>('#lightbox')
  const img = document.querySelector<HTMLImageElement>('#lb-img')
  const title = document.querySelector<HTMLElement>('#lb-title')
  const blurb = document.querySelector<HTMLElement>('#lb-blurb')

  document.querySelectorAll<HTMLButtonElement>('[data-lightbox]').forEach((tile) => {
    tile.addEventListener('click', () => {
      if (!dialog || !img || !title || !blurb) return
      const d = tile.dataset
      if (!d.src) return              // nothing to enlarge
      img.src = d.src
      img.alt = d.alt ?? ''
      title.textContent = d.title ?? ''
      blurb.textContent = d.blurb ?? ''
      dialog.showModal()
    })
  })

  document.querySelector('#lb-close')?.addEventListener('click', () => dialog?.close())

  // Clicking the backdrop (the dialog itself, not its children) closes it
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
  })
</script>
```

Key things to understand:

- **`showModal()`, not `show()`.** Only `showModal()` gives you the backdrop,
  Escape handling, and focus trapping.
- **`m-auto` on the dialog is load-bearing.** A modal `<dialog>` is centered by
  the browser's `margin: auto`, but **Tailwind's preflight sets `margin: 0` on
  every element** and clobbers it — so the dialog pins to the top-left corner.
  This bites every `<dialog>` in a Tailwind project. One class fixes it.
- **`::backdrop`** is a real pseudo-element; Tailwind exposes it as the
  `backdrop:` variant. That's the dimmed overlay.
- **`e.target === dialog`** works because the dialog's padding/backdrop area
  *is* the dialog element — clicks on the `<figure>` inside won't match.
- **`textContent`, not `innerHTML`** — your blurbs are plain text, and
  `textContent` can't inject markup. Keep it that way.

This is a plain `<script>` in an `.astro` file — Astro bundles it, no React
island, no hydration cost.

### Adding zoom

The implemented version (in `src/pages/gallery.astro`) has `+` / `−` buttons
and click-to-toggle. The one design decision worth copying:

**Zoom by changing the image's layout `width`, not `transform: scale()`.**

```js
if (zoom <= 1) {
  img.style.maxWidth = '100%'
  img.style.maxHeight = '92vh'
  img.style.width = 'auto'
} else {
  img.style.maxWidth = 'none'
  img.style.maxHeight = 'none'
  img.style.width = `${baseWidth * zoom}px`   // baseWidth = fitted width at 1x
}
```

Why it matters: `transform` doesn't affect layout, so a scroll container sees
no extra content and **you can't pan around a zoomed photo**. Changing the real
width makes the viewport overflow, and panning comes free — scroll on desktop,
drag on touch. Wrap the image in:

```html
<div class="flex max-h-[92vh] items-center justify-center overflow-auto overscroll-contain">
```

`items-center justify-center` keeps the photo centered while it still fits;
`overflow-auto` takes over once it doesn't.

Two details that'll bite otherwise:

- **Measure `baseWidth` inside `requestAnimationFrame`** after setting `img.src`.
  Measure too early and you capture the *previous* photo's dimensions.
- **Reset zoom on `close`** — otherwise the next photo opens at the last one's
  zoom level.

---

## Step 5 — Scroll-reveal

Don't reach for a library. `IntersectionObserver` is ~10 lines and is what the
libraries use anyway.

CSS in `src/styles/global.css`:

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}

/* Never animate for people who asked not to */
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

Script (same `<script>` block is fine):

```js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)   // reveal once, then stop watching
    })
  },
  { rootMargin: '0px 0px -10% 0px' },
)

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
```

Why it's built this way:

- **`unobserve` after revealing** — otherwise you keep firing callbacks forever
  as the user scrolls up and down.
- **`rootMargin: '-10%'`** triggers slightly *before* the element hits the
  viewport edge, so it's already fading in as it arrives rather than popping.
- **The reduced-motion block is not optional.** Without it, this is a
  vestibular-disorder problem for real users.

⚠️ **One real risk:** if JS fails, `.reveal` elements stay at `opacity: 0` —
your gallery is invisible. If that worries you, invert it: add a `js-enabled`
class to `<html>` via an inline script first, and scope the hidden state to
`.js-enabled .reveal`. Then no-JS users just see everything immediately.

---

## Step 6 — Check it on a phone

The grid already collapses (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), but
verify these specifically:

- **The lightbox on a small screen** — `max-h-[90vh]` + `max-w-[92vw]` keeps it
  on-screen, but a tall portrait photo plus a long blurb can still overflow. Add
  `overflow-y-auto` to the dialog if so.
- **Tap targets** — the whole tile is a `<button>`, so that's fine.
- **`sizes`** — with `sizes="(max-width: 640px) 100vw, 400px"` a phone downloads
  the 400px version, not the 800px one. Get this wrong and mobile users pay for
  desktop-sized images.

---

## Suggested order to actually build this

1. Data + a plain grid, no behavior. Confirm photos appear. **Commit.**
2. Split Highlights/Archive. **Commit.**
3. Lightbox. **Commit.**
4. Scroll-reveal. **Commit.**

Each step is independently shippable, so if something breaks you know exactly
what did it. Run `npm run build` before each commit — it catches missing alt
text and broken image imports that `npm run dev` will happily let through.
