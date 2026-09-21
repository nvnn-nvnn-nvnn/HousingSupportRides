# How a Photo Reaches the Screen

The full chain, from a filename in `content.ts` to a zoomable image in the
lightbox. Read this before changing anything in the gallery — most of the
non-obvious decisions in that code only make sense once you can see the whole
path.

Task guides live elsewhere: [../how-to/images.md](../how-to/images.md) for
Astro's image handling, [../how-to/gallery-page.md](../how-to/gallery-page.md)
for building the page from scratch, and
[../how-to/lightbox-navigation.md](../how-to/lightbox-navigation.md) for adding
arrow-key navigation.

---

## The short version

```
content.ts            GALLERY_IMAGES: { file, alt, title, blurb, date }
     │                                    a filename and some words
     ▼
gallery.astro         glob lookup      file  ──→ ImageMetadata
 (frontmatter)        date sort        newest first
                      getImage()       ImageMetadata ──→ 2000px WebP URL
                      slice            highlights / archive
     │                                    ════ BUILD TIME ENDS HERE ════
     ▼
GalleryGrid.astro     <Image>          the 400/800px thumbnail you can see
                      data-src         the 2000px URL, parked as an attribute
     │
     ▼
the browser           click            copy data-src into the dialog's <img>
                                       ──→ 2000px file downloads, now
```

Five transformations. A filename becomes an image module, the images get
ordered and split, each one is rendered twice at two different sizes, the
markup carries both, and the browser fetches the large one only when someone
asks for it.

---

## The boundary that explains everything

Almost every question about this code answers itself once you know **which side
of the build/browser line you are on.**

Everything in `gallery.astro`'s frontmatter — the part between the `---`
fences — runs **once, on your machine, during `npm run build`**. It reads files
off disk, generates resized images, and writes the results into the HTML. None
of it ships. There is no `import.meta.glob` in the browser, no `getImage`, no
sort.

Everything inside `<script>` runs **in the visitor's browser**, and by then the
HTML is already finished. It cannot resize an image or read `content.ts`; all
it can do is read the strings the build already wrote into the markup.

So when you find yourself asking *why is that URL sitting in an attribute
instead of being computed when I click?* — this is why. By click time there is
nothing left that could compute it.

---

## Stage 1 — The data

`GALLERY_IMAGES` in [`src/lib/content.ts`](../src/lib/content.ts) is the only
file you edit to add a photo. Each entry is five fields:

```ts
{ file: 'cover.jpg', alt: '…', title: '…', blurb: '…', date: '2026-09-20' }
```

`file` is a **bare filename**, not a path and not an import. That choice is what
forces Stage 2, and it is deliberate: you should be able to add a photo by
typing its name, without touching any component.

`date` is doing double duty — it sorts the gallery and it decides the
Highlights/Archive split. There is no `section: 'highlight' | 'archive'` flag,
because a flag would mean remembering to demote old photos by hand. With a
date, adding a photo pushes the oldest one into the Archive automatically.

## Stage 2 — Filename to image module

Photos live in `src/assets/img/gallery/`, **not** `public/`. That is what lets
Astro optimize them at all — anything in `public/` is copied to the output
untouched.

The cost is that you cannot build an import path out of a variable. This does
not work, and cannot be made to work:

```ts
import img from `../assets/img/gallery/${photo.file}`   // ✗ impossible
```

Bundlers resolve imports by reading your source, before any of your code runs,
so there is no moment at which `photo.file` has a value. `import.meta.glob` is
the way round it:

```ts
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/gallery/*.{jpg,jpeg,png,webp}',
  { eager: true },
)
```

Vite reads that **literal** pattern at build time and replaces it with a plain
object mapping every matching path to its imported module. Then a runtime
lookup is just an object property access:

```ts
const img = files[`../assets/img/gallery/${photo.file}`]?.default ?? null
```

The pattern cannot be a variable either — same reason. That restriction is the
whole mechanism, not a limitation to work around.

The `?? null` matters: a filename in `content.ts` with no matching file on disk
yields `null`, and Stage 5 renders a visible "Missing file: …" tile instead of
failing the build. A typo shows up as an obvious red square.

## Stage 3 — Order and split

```ts
const sorted = [...GALLERY_IMAGES].sort((a, b) => b.date.localeCompare(a.date))
const highlights = photos.slice(0, HIGHLIGHT_COUNT)
const archive    = photos.slice(HIGHLIGHT_COUNT)
```

ISO `YYYY-MM-DD` sorts correctly as a plain string, so no `Date` parsing is
needed. The spread before `.sort()` is not decoration — `sort` mutates in
place, and `GALLERY_IMAGES` is a shared module-level export.

## Stage 4 — Two renders per photo

This is the stage worth understanding properly, because it is the one that
shapes everything downstream.

Each photo is rendered at **two different sizes, for two different jobs**:

| | Made by | Size | Used by |
| --- | --- | --- | --- |
| Thumbnail | `<Image>` in `GalleryGrid` | 400 / 800px | the visible grid tile |
| Full | `getImage()` in `gallery.astro` | 2000px WebP | the lightbox |

The grid needs to be small — twenty of them load on arrival. The lightbox needs
to survive being zoomed to 5×, which a 400px file cannot do.

```ts
const full = img
  ? await getImage({ src: img, width: 2000, format: 'webp', quality: 72 })
  : null
return { ...photo, img, fullSrc: full?.src ?? '' }
```

`getImage()` returns a URL string rather than markup, which is exactly what is
needed for something that will sit in an attribute rather than render as an
element.

**Two size traps live here, and both cost real megabytes.** Neither is obvious
and both have bitten this codebase:

1. **`quality: 72` is explicit on purpose.** `getImage()` defaults to a quality
   high enough that a 2000px WebP re-encoded from a 4000px phone photo can come
   out *larger than the original JPEG* — you do the work of optimizing and ship
   a bigger file. If a render is ever unexpectedly heavy, check this first.
2. **`width`/`height` are pinned on `<Image>`, not just `widths`.** Given only
   `widths`, Astro renders the plain `src` fallback at the source image's *full*
   size. Our sources are ~4000px multi-megabyte phone photos, so every client
   that ignores `srcset` would download one. Pinning `width={800}` makes the
   fallback the 800px render.

Both are documented in [../how-to/images.md](../how-to/images.md) under "Two
sizing traps that cost real megabytes."

## Stage 5 — Markup

[`GalleryGrid.astro`](../src/components/GalleryGrid.astro) is used twice —
once for Highlights, once for Archive with `dense` for tighter tiles. Each
photo becomes a `<button>` wrapping the thumbnail and its caption, so the whole
card is one click target:

```html
<li>
  <button data-lightbox data-src="…2000px…" data-alt="…">
    <div class="aspect-[4/3]"><img …400/800px… /></div>
    <div class="p-4"><h3>title</h3><p>blurb</p></div>
  </button>
</li>
```

The `data-*` attributes are the entire interface to the lightbox:

| Attribute | Value | Why |
| --- | --- | --- |
| `data-lightbox` | none — a marker | Says "this one is mine." The script selects `[data-lightbox]`; the page has plenty of other buttons. |
| `data-src` | the 2000px URL | Exists nowhere else in the DOM. Without it the lightbox has no way to find the large render. |
| `data-alt` | the alt text | Carried over so the dialog stays accessible. |
| `data-title` | the tile heading | Shown in the lightbox caption. |
| `data-blurb` | the sentence under it | Same. Both written with `textContent`, never `innerHTML`. |

**Why `[data-lightbox]` cannot match the wrong thing.** `GalleryGrid.astro:43`
is the only line in the codebase that *writes* that attribute, and it sits
inside the `.map()`, so it lands on exactly one button per photo and on nothing
else. Every other reference — the two `querySelectorAll` calls and a comment —
only reads it. The guarantee is therefore structural rather than a convention
anyone has to remember: the navbar links, the donate button, the zoom controls
and Close cannot collide with the selector because nothing in the project is
capable of producing the attribute on them.

Sanity check, any time the count looks wrong:

```bash
curl -s localhost:4321/gallery | grep -o "data-lightbox" | wc -l   # 32
grep -c "file: '" src/lib/content.ts                               # 32
```

Those two numbers should always match. One tile per entry, no more, no fewer.

**One component, used twice, gives one flat list.** `GalleryGrid` renders
Highlights and then Archive, so `querySelectorAll` returns them in DOM order as
`[...6 highlights, ...26 archive]` — a single continuous array with no seam in
it. That is why arrowing past the last highlight walks straight into the
archive, and it is a consequence of the markup order rather than anything the
navigation code decides. Scoping the query to one `<ul>` is how you would get
per-section navigation instead.

**Why a `<button>` and not a `<div onclick>`.** The button is what makes the
tile focusable, operable with Enter and Space, and announced as a control by
screen readers. That is behaviour you would otherwise have to rebuild by hand,
badly. `data-lightbox` does not make anything clickable — the button already is.
It only marks *which* clickable things this script should wire up.

**Same contract, different syntax, for the dialog's own controls.** The tiles
are found by attribute (`[data-lightbox]`, many of them); the lightbox buttons
are found by id (`#lb-prev`, one each). Either way the markup names something
and the script goes looking for that exact string — and either way a mismatched
name returns `null` rather than raising anything. See
[CHANGELOG.md](./CHANGELOG.md) 2026-09-21, "The naming contract."

The tile carries **four** payload attributes: `data-src` and `data-alt` for the
image, `data-title` and `data-blurb` for the caption the dialog overlays on the
photo. All four are read in `show()`; nothing else in the browser knows where
they came from.

**Why data attributes and not a class.** A class says *style me*; someone
pruning unused CSS deletes it and the gallery silently stops opening. A `data-`
attribute is the conventional signal that JavaScript depends on this.

## Stage 6 — The browser

Now everything above is finished and frozen into HTML. The script does one
thing:

```js
img.src = tile.dataset.src          // the dialog's <img>, not the tile's
img.alt = tile.dataset.alt ?? ''
dialog.showModal()
```

#### How it knows *which* photo: index in, attributes out

Nothing is ever searched for or matched by name. A number travels in, and one
button's attributes come out:

```js
const tiles = [...document.querySelectorAll('[data-lightbox]')]  // the list

tiles.forEach((tile, i) => {              // forEach hands each button its index
  tile.addEventListener('click', () => open(i))   // baked in permanently
})

function show(i) {
  const tile = tiles[i]                   // back to that exact button
  img.src = tile.dataset.src              // read everything off it
  captionBlurb.textContent = tile.dataset.blurb
}
```

Button 7's handler closes over `7` and can say nothing else, so a click reports
its own position and `tiles[7]` is necessarily the button that was clicked.

This is also why a photo's image and its caption cannot drift apart. They were
never separate: one entry in `GALLERY_IMAGES` is one object, that object renders
one `<button>`, and every attribute on it came from the same `photo` in the same
iteration of the same `.map()`. There is no join anywhere in the chain that
could line up the wrong two things.

And it is why the arrow keys and the ‹ › buttons cost two lines each — they are
just other ways of choosing the number. `show(current + 1)` is the entire
feature.

There are **two `<img>` elements**, and this is the point people trip on:

```
TILE (in the grid)                    DIALOG (the lightbox)
┌──────────────────────┐              ┌──────────────────────┐
│ <button data-…>      │              │ <img id="lightbox-   │
│   <img> ← 400/800px  │              │       img" src="">   │
│   data-src ─────────────── click ──────→ src = 2000px URL  │
└──────────────────────┘              └──────────────────────┘
     untouched, stays in the grid         was empty, now fills
```

The thumbnail is never enlarged. A second, larger file loads into a second
element. That is why the lightbox looks sharp — you are showing 2000 real
pixels, not stretching 400.

It is also why the page is fast. The large renders exist on the server from
build time but **download only for photos someone actually opens** — usually
one or two out of twenty. Had the 2000px URLs gone into the grid's `<img>`
tags, every visitor would pay for all of them on arrival.

Once loaded, the dialog measures the image and resets zoom:

```js
const onReady = () => requestAnimationFrame(() => { measureBase(); resetView() })
if (img.complete) onReady()
else img.addEventListener('load', onReady, { once: true })
```

Measuring immediately after setting `src` captures the **previous** photo's
dimensions — the browser has not laid the new one out yet. Hence the `load`
event, the `requestAnimationFrame`, and the `img.complete` branch for a photo
already in cache (where `load` will never fire again).

---

## Changing things

| To do this | Touch this |
| --- | --- |
| Add or remove a photo | `GALLERY_IMAGES` in `content.ts` — and drop the file in `src/assets/img/gallery/` |
| Change how many photos are Highlights | `HIGHLIGHT_COUNT` in `content.ts` |
| Reorder the gallery | the `date` fields — nothing else |
| Change tile sizes or columns | `GalleryGrid.astro` |
| Change lightbox resolution | the `getImage({ width: 2000 })` call in `gallery.astro` |
| Add lightbox behaviour (arrows, captions) | the `<script>` in `gallery.astro` — see [../how-to/lightbox-navigation.md](../how-to/lightbox-navigation.md) |

---

## Traps

- **`m-auto` on the `<dialog>` is load-bearing.** A modal dialog is centred by
  the UA stylesheet's `margin: auto`, and Tailwind's preflight sets
  `margin: 0` on every element, clobbering it. Without `m-auto` the dialog pins
  to the top-left corner. This bites every `<dialog>` in a Tailwind project.
- **Exactly one `querySelectorAll('[data-lightbox]')` should exist in
  `gallery.astro`.** A second one means two click listeners per tile, and the
  duplicate calls `showModal()` on an already-open dialog, which throws. This
  happened once already — see [CHANGELOG.md](./CHANGELOG.md) 2026-09-21.
- **There are currently two lightbox implementations.**
  [`Lightbox.astro`](../src/components/Lightbox.astro) is a cleaner extraction
  that is **not wired into any page**; the live one is the inline `<dialog>` and
  `<script>` at the bottom of `gallery.astro`. They share element ids, so
  rendering both at once breaks `querySelector`. The component's header comment
  has the three-step swap.
- **Zoom is `transform` with hand-rolled panning**, not layout `width`. The
  "Adding zoom" section of `how-to/gallery-page.md` describes the older
  width-based design and is out of date — following it would undo working code.
- **`alt` is mostly placeholder.** Only the three entries marked `// ✓ reviewed`
  in `GALLERY_IMAGES` have real alt text. See
  [todo-next-steps.md](./todo-next-steps.md) § 7 — this is an accessibility
  failure, not merely unfinished copy.
