# Learning: Click-to-Enlarge Photos in Blog Posts

A guided project in 5 exercises. **Nothing here is built yet. You build it.**
When you finish, clicking any photo inside a journal post opens it big, over a
dark background, with Close, Esc, and ← / → between photos.

Each exercise has:
- **Goal:** what should work when you're done.
- **Hints:** read these if you're stuck. Try first.
- **Answer:** hidden (click to open). Check *after* you've tried.
- **Check:** how to prove it works.

Make a branch first:

```bash
git checkout -b post-lightbox
```

Written 2026-11-24, against the code as it was then.

---

## Before you start: how it fits together

**A "lightbox"** is just a box that pops up over the page showing one photo
large. The gallery already has one (`src/pages/gallery.astro`, bottom of the
file); you'll build a simpler one for posts.

**Three pieces:**

| Piece | What it is | Where |
| --- | --- | --- |
| The **photos** | Whatever an admin put in the post body. Keystatic saves them as `![alt](/img/journal/x.jpg)`, which becomes a plain `<img>` inside `<div class="article-body">` | Rendered by `<Content />` in [`src/pages/journal/[...slug].astro`](../src/pages/journal/[...slug].astro) |
| The **box** | A `<dialog>` element. The browser gives you the dark backdrop, Esc-to-close, and keyboard focus trapping for free | You add it to the same file |
| The **script** | Finds the photos, listens for clicks, puts the clicked photo's address into the box, opens it | A `<script>` at the bottom of the same file |

**Why a script and not just HTML?** The post body is written by admins in the
editor. You can't add `onclick` to their photos by hand, so the script finds
them after the page loads: `document.querySelectorAll('.article-body img')`.

**You need a post with photos to test.** No post has body photos yet. Run
`npm run dev`, open `http://localhost:4321/keystatic`, open any journal post,
and add 2–3 photos with the toolbar's image button. Save (local mode: it just
writes files on your computer). Don't commit the test photos.

---

## Exercise 1 — Add the box

**Goal:** an empty `<dialog>` is on the post page (invisible until opened).

**Hints**
- Put it right after `</article>`, still inside `<SiteLayout>`.
- It needs: an `id` (say `post-lightbox`), an `<img>` inside with its own id,
  and a **Close** button.
- Copy the look from the gallery's `<dialog>`: `m-auto`, `max-h-[92vh]`,
  `max-w-[95vw]`, `p-0`, `backdrop:bg-black/80`.

**Two traps in this codebase**
1. **Forget `m-auto` and it sticks to the top-left corner.** Tailwind resets
   every margin to 0, which removes the browser's normal centering.
2. **Don't add `relative` to the `<dialog>`.** An open dialog is already
   positioned (`position: fixed`), so the Close button can use `absolute`
   without it. `relative` would override `fixed` and break the centering.

<details>
<summary>Answer</summary>

```astro
<dialog
  id="post-lightbox"
  class="m-auto max-h-[92vh] max-w-[95vw] overflow-hidden rounded-xl bg-[var(--background)] p-0 backdrop:bg-black/80"
>
  <button
    id="plb-close"
    type="button"
    aria-label="Close image"
    class="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80"
  >Close</button>
  <img id="plb-img" src="" alt="" class="max-h-[92vh] w-auto max-w-full" />
</dialog>
```
</details>

**Check:** the page looks exactly the same as before. In DevTools (F12) →
Elements, the `<dialog>` is there.

---

## Exercise 2 — Click a photo, it opens

**Goal:** clicking a photo opens the box with that photo. Close, Esc, and
clicking the dark backdrop all close it.

**Hints**
- Add `<script>` after the dialog. Astro runs it once the page has loaded.
- Grab three things: the dialog, the big `<img>`, and every
  `.article-body img` (spread into an array: `[...document.querySelectorAll(…)]`).
- On click: copy the photo's `src` **and** `alt` to the big image, then
  `dialog.showModal()`. (`showModal`, not `show`: only `showModal` gives the
  backdrop and Esc.)
- Backdrop click: when you click the backdrop, the event's `target` is the
  dialog itself. When you click the photo, it's the photo.
- Give the photos a `cursor-zoom-in` class so people know they can click.

<details>
<summary>Answer</summary>

```astro
<script>
  const dialog = document.querySelector<HTMLDialogElement>('#post-lightbox')
  const big = document.querySelector<HTMLImageElement>('#plb-img')
  const photos = [...document.querySelectorAll<HTMLImageElement>('.article-body img')]

  function open(photo: HTMLImageElement) {
    if (!dialog || !big) return
    big.src = photo.currentSrc || photo.src
    big.alt = photo.alt // keep it accessible: screen readers announce this
    dialog.showModal()
  }

  photos.forEach((photo) => {
    photo.classList.add('cursor-zoom-in')
    photo.addEventListener('click', () => open(photo))
  })

  document.querySelector('#plb-close')?.addEventListener('click', () => dialog?.close())

  // Clicked the dark area (the dialog itself), not the photo inside it
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
  })
</script>
```

`?.` means "only if it exists", so a page with no dialog doesn't crash.
</details>

**Check:** click a photo → it opens big. Close, Esc, and backdrop click each
close it. A post with **no** photos still loads with no errors in the
Console (F12).

---

## Exercise 3 — Works without a mouse

**Goal:** a keyboard user can Tab to a photo, press **Enter** to open it, and
lands back on that photo after closing.

**Why:** a plain `<img>` can't be reached with Tab. Without this, the feature
only exists for mouse and touch users.

**Hints**
- `photo.tabIndex = 0` makes it reachable with Tab.
- `role="button"` and an `aria-label` tell screen readers it does something.
- Listen for `keydown`: Enter or Space opens it. Call `e.preventDefault()` on
  Space, or the page scrolls.
- Returning focus on close: the browser already does this for `showModal()`.
  Just check it.

<details>
<summary>Answer</summary>

Inside the `forEach`, under the click listener:

```ts
photo.tabIndex = 0
photo.setAttribute('role', 'button')
photo.setAttribute('aria-label', `Enlarge photo: ${photo.alt || 'photo'}`)
photo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    open(photo)
  }
})
```
</details>

**Check:** unplug the mouse (figuratively). Tab until a photo gets a focus
ring → Enter → Esc → focus is back on that photo.

---

## Exercise 4 — Previous / next

**Goal:** ← / → keys (and two buttons) move between the post's photos,
wrapping from the last back to the first. With only one photo, the buttons
don't show.

**Hints**
- Switch from "open this photo" to "open photo number `i`". Keep a
  `current` number.
- Wrapping: `(i + n) % n`, where `n` is the number of photos. The `+ n`
  matters: in JavaScript `-1 % 3` is `-1`, not `2`. (The gallery's `show()`
  has a comment about exactly this.)
- Only react to arrow keys **while the dialog is open** (`dialog.open`).
- Buttons: same style as the gallery's `lb-prev` / `lb-next`. Hide them with
  `hidden` when `photos.length < 2`.

<details>
<summary>Answer</summary>

Replace `open` with:

```ts
let current = 0

function show(i: number) {
  if (!big) return
  const n = photos.length
  current = (i + n) % n
  const photo = photos[current]
  big.src = photo.currentSrc || photo.src
  big.alt = photo.alt
}

function open(i: number) {
  if (!dialog) return
  show(i)
  dialog.showModal()
}

// forEach gives the index for free
photos.forEach((photo, i) => {
  photo.addEventListener('click', () => open(i))
  // …and open(i) in the keydown listener from Exercise 3
})

document.addEventListener('keydown', (e) => {
  if (!dialog?.open) return
  if (e.key === 'ArrowRight') show(current + 1)
  if (e.key === 'ArrowLeft') show(current - 1)
})
```

Buttons, inside the dialog:

```astro
<button id="plb-prev" type="button" aria-label="Previous photo"
  class="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80">‹</button>
<button id="plb-next" type="button" aria-label="Next photo"
  class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80">›</button>
```

```ts
const prevBtn = document.querySelector<HTMLButtonElement>('#plb-prev')
const nextBtn = document.querySelector<HTMLButtonElement>('#plb-next')
prevBtn?.addEventListener('click', () => show(current - 1))
nextBtn?.addEventListener('click', () => show(current + 1))
if (photos.length < 2) {
  prevBtn?.classList.add('hidden')
  nextBtn?.classList.add('hidden')
}
```
</details>

**Check:** 3 photos: → → → lands back on the first. ← from the first goes to
the last. A post with 1 photo shows no arrows.

---

## Exercise 5 (stretch) — Reuse one lightbox everywhere

No answer for this one: it's a design exercise.

The unfinished [`src/components/Lightbox.astro`](../src/components/Lightbox.astro)
(your zoom-and-pan build) works with **any** element that has three
attributes: `data-lightbox`, `data-src`, `data-alt`. The post photos could
use it too, which gets them zoom for free.

Things to work out:
- Your script would have to **stamp** those attributes onto each
  `.article-body img`. But `Lightbox.astro` collects its photos the moment
  its own script runs. Which runs first? How would you make sure the stamping
  happens before, or make `Lightbox.astro` look for photos at click time
  instead?
- The cover photo is drawn by a React component (`MediaPlaceholder`). Should
  it open in the lightbox too?
- Once both pages use `Lightbox.astro`, delete the duplicate code in
  `gallery.astro` (see the warning at the top of `Lightbox.astro` about
  duplicate ids).

---

## When you're done

1. `npm run build`: must pass.
2. Delete the test photos you added in Keystatic (or `git restore` them).
3. Add a CHANGELOG entry, and mark this page ✅ Built in
   [README.md](./README.md).
4. Merge your branch.
