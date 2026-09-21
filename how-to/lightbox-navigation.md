# Arrow-Key Navigation in the Lightbox

> New to this code? [gallery-pipeline.md](../notes/gallery-pipeline.md) walks the whole chain — how a
> filename in `content.ts` becomes the two renders a tile carries, and why
> `data-src` exists. The `tiles` array below is the last link in it.

Goal: with a photo open, pressing **←** / **→** moves to the previous or next
photo without closing the lightbox. Plus on-screen ‹ › buttons, because arrow
keys are invisible to anyone on a phone.

Read [gallery-page.md](./gallery-page.md) first — this assumes you know how the
grid hands photos to the lightbox via `data-` attributes.

This guide is written to be *implemented*, not copy-pasted. The boilerplate is
spelled out; the two or three bits that are actually worth writing yourself are
left as shapes with TODOs.

---

## The problem, in one line

**The lightbox doesn't know which photo it's showing.**

Look at what the current click handler stores:

```js
img.src = tile.dataset.src   // a URL. That's the whole memory.
```

A URL has no neighbors. You can't ask a string "what comes after you?" So
there's nothing for → to *do*.

Everything below is one idea expressed four ways: **give it an index.**

```
now:     click → [ load this URL ]
after:   click → show(3) ──┐
         press → ──────────┤──→ [ load tiles[i] ]
         press ← ──────────┤
         click › ──────────┘
```

Four triggers, one path. Once that path exists, arrow keys are about five lines.

---

## Step 1 — Snapshot the tiles

```js
const tiles = [...document.querySelectorAll('[data-lightbox]')]
```

Two things happening:

- **`[data-lightbox]`** is an attribute selector — "every element carrying this
  attribute, whatever its value." `GalleryGrid` stamps it on every tile button.
- **The spread `[...]`** turns the `NodeList` into a real array, so you get
  index access and `.length` without ceremony.

⚠️ **This spans both grids.** Highlights renders first, then Archive, so `tiles`
is `[...6 highlights, ...27 archive]` in DOM order. Moving past the last
highlight lands you on the first archive photo. That's probably what you want —
one continuous gallery — but decide it deliberately rather than discovering it.

If you ever want per-section navigation, scope the query to the containing
`<ul>` instead of the whole document.

---

## Step 2 — Track the position

```js
let current = -1   // -1 = nothing open
```

That's the entire new state. One number.

---

## Step 3 — Extract `show()` — this is the real work

Right now "load a photo" is trapped inside "someone clicked a tile":

```js
// before — the logic is stuck inside the event handler
tile.addEventListener('click', () => {
  img.src = tile.dataset.src
  img.alt = tile.dataset.alt ?? ''
  dialog.showModal()
})
```

The arrow keys have no way to reach in there. Pull it out:

```js
/**
 * Show tile `i`. The single entry point — clicks, arrow keys, and the
 * prev/next buttons all route through here. Nothing else sets img.src.
 */
function show(i: number) {
  // TODO 1. normalize i — wrap or clamp? (see "Decisions")
  // TODO 2. current = i
  // TODO 3. read tiles[current].dataset.src / .alt into the img
  // TODO 4. once the new photo has actually loaded: measureBase(), resetView()
}

function open(i: number) {
  show(i)
  dialog.showModal()
}
```

Splitting `show` from `open` matters: `show` swaps the photo, `open` also makes
the dialog visible. Arrow keys want the first without the second — the dialog is
already open, and calling `showModal()` on an open dialog throws.

### TODO 4 deserves its own note

The photo isn't loaded the instant you set `.src`. Measuring right away captures
the **previous** photo's dimensions:

```js
const onReady = () => requestAnimationFrame(() => {
  measureBase()
  resetView()
})

if (img.complete) onReady()          // already cached — fires no load event
else img.addEventListener('load', onReady, { once: true })
```

- **`img.complete`** is true for a cached image, which never fires `load`. Skip
  this branch and navigating back to a photo you've already seen silently fails
  to re-measure.
- **`{ once: true }`** auto-removes the listener. Without it you stack a fresh
  listener on every navigation and they *all* fire on the next load.
- **`requestAnimationFrame`** waits for the browser to actually lay the image
  out. `load` means "bytes arrived," not "the box has a size."

This exact pattern is already in `gallery.astro` — it's how the click handler
works today. You're moving it, not inventing it.

---

## Step 4 — Wire the tiles

```js
tiles.forEach((tile, i) => {
  tile.addEventListener('click', () => open(i))
})
```

`.forEach` hands you the index for free as its second argument. That index —
captured in the closure — is what each tile permanently "knows" about itself.
That's the whole mechanism by which a click becomes a position.

---

## Step 5 — The key handler

```js
document.addEventListener('keydown', (e) => {
  if (!dialog.open) return
  if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1) }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); show(current - 1) }
})
```

| Detail | Why |
| --- | --- |
| `e.key` | Readable strings (`'ArrowRight'`, `'Escape'`, `'a'`). `e.keyCode` is deprecated — don't learn it. |
| `if (!dialog.open) return` | Without it, arrows navigate an invisible lightbox while someone is just reading the page. |
| `e.preventDefault()` | Stops arrows scrolling the page or shifting focus between the controls. |
| No `Escape` case | `showModal()` handles Escape natively. One of the real perks of `<dialog>`. |

You *could* listen on `dialog` instead of `document` and drop the guard, since a
modal dialog holds focus. Both work. `document` + guard is the version that
won't surprise you later.

---

## Step 6 — The ‹ › buttons

The skeleton already has `#lb-prev` and `#lb-next` in the markup.

```js
prevBtn?.addEventListener('click', () => show(current - 1))
nextBtn?.addEventListener('click', () => show(current + 1))
```

Don't skip these. Arrow keys are discoverable by roughly nobody, and useless on
touch. The buttons also give you somewhere to show "you're at the end" if you go
with clamping.

---

## Decisions you have to make

### Wrap or clamp?

**Wrap** — past the last photo, back to the first:

```js
const n = tiles.length
i = (i + n) % n
```

⚠️ **That `+ n` is load-bearing.** In JavaScript, `-1 % 33` is `-1`, not `32` —
JS modulo keeps the sign of the left operand, unlike Python. Drop the `+ n` and
pressing ← on the first photo gives you `tiles[-1]`, which is `undefined`, and
the lightbox goes blank with no error. This is *the* classic bug in this feature.

**Clamp** — stop at the ends:

```js
i = Math.max(0, Math.min(tiles.length - 1, i))
```

Then disable `#lb-prev` at `0` and `#lb-next` at the end — the same way
`render()` already disables the zoom buttons at their limits.

Wrap feels right for a photo gallery. Clamp feels right when position matters.
Wrap is less code; clamp is more honest about where you are.

### Should arrows navigate while zoomed in?

If someone is zoomed 4× examining a face, → jumping to the next photo might feel
like losing their place. Two options:

- **Always navigate**, and let `resetView()` handle it. Simple, predictable.
- **Pan while zoomed, navigate only at `scale === 1`.** Clever, but now arrows
  mean two different things depending on invisible state.

Recommendation: always navigate. Try the other one if it bothers you — it's a
two-line difference.

---

## Gotchas checklist

- [ ] **`+ n` before the modulo.** Negative modulo. See above.
- [ ] **`resetView()` on every change, not just on open.** Otherwise photo 6
      arrives still zoomed to 3× and panned to coordinates that meant something
      for photo 5.
- [ ] **Re-measure after the new photo loads.** Portrait → landscape makes the
      breakage obvious: pan clamping computed against the wrong dimensions lets
      the photo drift somewhere it shouldn't go.
- [ ] **`{ once: true }` on the load listener.** Or they pile up.
- [ ] **Don't call `showModal()` from `show()`.** It throws on an already-open
      dialog. That's why `open()` is separate.
- [ ] **Reset `current = -1` on close.** Not strictly required — the guard
      catches it — but it keeps the state honest.

---

## Test it like this

1. Open the first Highlight, press ← — wrap: last archive photo. Clamp: nothing.
2. Open the last Archive photo, press → — the other end of the same test.
3. Zoom in 3×, press → — the next photo should arrive **fitted**, not zoomed.
4. Open a portrait photo, → to a landscape one, then drag — the pan should stop
   at the real edges, not somewhere arbitrary.
5. Navigate back to a photo you've already viewed — this is the `img.complete`
   path. Still measures correctly?
6. Close the lightbox, press → — nothing should happen.
7. Hold → down — should cycle smoothly, not queue up and lurch.
8. On a phone: the ‹ › buttons are the only way through. Are they reachable
   without covering the photo?

---

## Stretch, once it works

**Preload the neighbors.** Right now → shows a blank frame while a 2000px WebP
downloads. Fix it in four lines:

```js
for (const j of [current - 1, current + 1]) {
  const t = tiles[(j + tiles.length) % tiles.length]
  if (t) new Image().src = t.dataset.src
}
```

Creating an `Image()` and setting `.src` starts the download straight into cache
without putting anything on the page. Cheap trick, large perceived difference.

**Swipe on touch.** You already track pointers for panning. A horizontal drag at
`scale === 1` that passes some threshold is a swipe — reuse the `moved` flag and
`downX` that the pan code already maintains.

**Announce the change.** Screen readers won't notice the photo swapped. An
`aria-live="polite"` region updated with `"3 of 33 — {title}"` fixes that, and
doubles as a nice visible counter.

---

## Suggested build order

Each step works on its own, so if something breaks you know exactly what did it.

1. `tiles` array + `current` + extract `show()`, with clicks routed through it.
   **The gallery should behave exactly as before.** Commit.
2. Prev/next buttons. Commit.
3. Arrow keys. Commit.
4. Preloading / swipe / aria-live, if you want them. Commit.

Step 1 is the one that matters. It changes no behavior at all — which is exactly
how you know the refactor is right. Everything after it is small.
