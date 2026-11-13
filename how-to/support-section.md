# The Support Us Section

✅ **Built 2026-11-12.** The homepage's maroon "Support Us" block is split in
two: a photo slideshow on the left, and the message, three "where your gift
goes" points, and the Donate button on the right. On phones and tablets the
photos stack on top.

It reuses the hero's slideshow logic. Read
[hero-carousel.md](./hero-carousel.md) Part 2 for how crossfading works; this
guide only covers what's different.

## Where everything lives

| What | Where |
| --- | --- |
| The section (layout, text, Donate button) | `src/components/sections/DonateBlock.tsx` |
| The slideshow half | `SupportSlideshow`, in the same file |
| The list of photos (order, alt text) | `SUPPORT_IMAGES` in `src/lib/content.ts` |
| The photo files, two sizes each | `public/img/support/support-N-1200.jpg` and `-800.jpg` |
| The timer, pause and reduced-motion logic | `src/hooks/useSlideshow.ts` (shared with the hero) |
| The three "where your gift goes" points | `GIFT_USES` at the top of `DonateBlock.tsx` |

---

## Adding or swapping a photo

1. **Choose a photo of people doing something:** serving, setting up,
   celebrating. These sit next to the Donate button, so they should show what
   a gift makes possible.
2. **Make both sizes, cropped to 4:3.** Run this from the project root, changing
   the input path and the number:
   ```bash
   node -e "const s=require('sharp');for(const w of [1200,800])s('src/assets/img/gallery/IMG_XXXX.jpg').rotate().resize({width:w,height:Math.round(w*3/4),fit:'cover'}).jpeg({quality:72,mozjpeg:true}).toFile('public/img/support/support-6-'+w+'.jpg')"
   ```
   `fit:'cover'` crops to exactly 4:3 from the centre. Check the result: if
   someone's head is cut off, pick another photo.
3. **Add it to `SUPPORT_IMAGES`** in `src/lib/content.ts`:
   ```ts
   { src: '/img/support/support-6', alt: 'Describe the photo for someone who can’t see it' },
   ```
   `src` is the base path, without `-1200.jpg`.
4. **Check** at 390px wide and at desktop width.

To remove a photo, delete its entry, then its two files. **Permission:** as
with the hero, the people shown should have agreed to appear on the site.

### Why the sizes differ from the hero's

| | Hero | Support Us |
| --- | --- | --- |
| Frame | Full screen width, 4:5 on phones / 4:3 on wider screens | At most ~540px wide, **4:3 everywhere** |
| Files | 1920 + 1080 wide | 1200 + 800 wide |
| Cropping | Phones crop the sides | None: the files are pre-cut to 4:3 |

The frame never gets wider than about 540px on desktop, so a 1920px file would
only waste data. 1200px covers a high-density laptop screen, and 800px covers
phones.

---

## How it works

### The layout

```tsx
<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
  <SupportSlideshow />   {/* left on desktop, top on phones */}
  <div>…text and Donate…</div>
</div>
```

- **One column below 1024px** (`lg:`). Phones and tablets get photos first,
  then the text, so the section opens with a picture rather than a paragraph.
- **Two equal columns from 1024px up**, centred vertically (`items-center`).
- The **Donate button** is full width on phones (an easy thumb target) and
  natural width from 640px up (`sm:inline-flex sm:w-auto`).

### The slow zoom ("Ken Burns" effect)

The photo that's showing slowly zooms from 110% to 100% while it's up. Each
image has two transitions at once, set by one inline style:

```tsx
className="transition-[opacity,transform] …"
style={{ transitionDuration: `1000ms, ${SUPPORT_SLIDE_MS + 1500}ms` }}
```

The two durations line up with the two properties, in order:
- **opacity:** 1 second, the crossfade.
- **transform:** 6.5 seconds, the zoom. That's longer than the 5-second slide,
  so the photo is still drifting when the next one fades in, and the motion
  never stops dead.

The active photo has `scale-100`; the others have `scale-110`. When a photo
becomes active it transitions from 110 to 100, which is the zoom.

**Reduced motion:** the hook reports `reduced`. When it's true, the slideshow
starts paused, and the component drops both the transition and the 110% scale,
so photos change instantly and never move.

### The shared hook

`src/hooks/useSlideshow.ts` started life inside `Hero.tsx`. With a second
slideshow on the page, it moved to `src/hooks/` so both use the same code:

```tsx
const { index, setIndex, playing, togglePlaying, setHeld, reduced } =
  useSlideshow(SUPPORT_IMAGES.length, { intervalMs: 5000 })
```

| Option | Hero | Support Us | Why |
| --- | --- | --- | --- |
| `intervalMs` | 6000 | 5000 | Supporting photos can move a little faster |
| `waitForLoad` | `true` | `false` | Only the hero holds the page's main image. This section is further down, so its images just use `loading="lazy"` |

`togglePlaying` is the Pause/Play handler. It also clears the hover pause,
which was a real bug in the first version of the hero: Play is clicked *while
hovering*, so without that it did nothing.

### Accessibility

The same rules as the hero:
- A **Pause** button, so it passes WCAG 2.2.2.
- **Hover pauses** it.
- **Reduced motion** starts it paused, with no zoom.
- Hidden slides are `aria-hidden`, and the block is labelled as a carousel.

---

## The text

- **"Where your gift goes"** (`GIFT_USES`) is the three programs, worded from
  `PROGRAMS` in `content.ts`. It deliberately has **no dollar figures**. The
  old `DONATION_TIERS` ("$25 covers a week of rides…") aren't verified, and
  showing them would be a claim to donors. Add numbers here only once they're
  real.
- The **"GIVE" label** above the heading has its color set inline. The
  site-wide `.eyebrow` style in `global.css` overrides any Tailwind color
  class, which made it maroon on maroon. It had been invisible since before
  this redesign. The same trap applies to any `.eyebrow` placed on a dark
  background.
- The **501(c)(3) line** still only says "nonprofit organization." Don't claim
  donations are tax-deductible until the status and EIN are confirmed.

---

## Gotchas

| Symptom | Cause | Fix |
| --- | --- | --- |
| A photo is broken | Only one of its two sizes exists, or `src` includes `.jpg` | Check both files exist, and `src` is the base path |
| A photo looks letterboxed or oddly cropped | The file isn't 4:3 | Re-run the sharp command with `fit:'cover'` |
| Photos zoom and fade at the same speed | The `transitionDuration` style lost its second value | Keep both durations: `1000ms, 6500ms` |
| A label disappears on the maroon background | `.eyebrow` overriding a color class | Set `style={{ color: … }}` instead |
| Nothing animates, in dev only | Stale dev-server cache | Restart `npm run dev` (see hero-carousel.md → Gotchas) |
