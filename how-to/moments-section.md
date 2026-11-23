# Photos Around the Site: Moments, Page Headers, Cards, Sign-Up Form

Added 2026-11-16. This guide covers every place photos were added in that
round, how to swap a photo, and the one script that prepares them.

| Where | What it is | Data lives in |
| --- | --- | --- |
| Homepage → **"Out in the Community"** | Photo mosaic: 1 big + 4 small, links to `/gallery` | `MOMENTS` in `src/lib/content.ts` |
| Homepage → **"Three Ways to Help"** | Photo cards with the icon on the photo's edge | `INVOLVEMENT` (`image`, `alt`) in `content.ts` |
| `/volunteer` | Photo cards for each role + a "Not sure which fits?" band | `roles` at the top of `src/pages/volunteer.astro` |
| `/volunteer/*`, `/contact` | Photo **page headers** | `image="..."` on `<PageHeader>` in each page |
| `/volunteer/apply` | Redesigned sign-up form | `src/pages/volunteer/apply.astro` |
| `/contact` | Form in a card, contact details with icons, a photo | `src/pages/contact.astro` |

---

## Step 1: Prepare a photo (always)

Phone photos are 3–6 MB. Never put one on the site as-is. One command crops
and shrinks it:

```bash
npm run img -- <photo> <where-to-save> <shape> <widths> [anchor]
```

Example. Make a new "Three Ways to Help" card photo:

```bash
npm run img -- src/assets/img/gallery/IMG_20260920_024701.jpg public/img/cards/driver 3:2 640,960
```

That writes `public/img/cards/driver-640.jpg` and `driver-960.jpg` and prints
each size. Leave off the `-640.jpg` when you use it in code: the components
add the sizes themselves.

| Place | Folder | Shape | Widths |
| --- | --- | --- | --- |
| Page header | `public/img/headers/` | `16:7` | `1080,1920` |
| Card (homepage + /volunteer) | `public/img/cards/` | `3:2` | `640,960` |
| Moments, small tile | `public/img/moments/` | `4:3` | `600,900` |
| Moments, **big** tile (first) | `public/img/moments/` | `4:3` | `600,900,1400` |
| Sign-up form photo | `public/img/forms/` | `4:5` | `600,900` |

**Heads cut off?** Add an anchor as the last word: `top` keeps the top of the
photo, `attention` lets the tool guess the interesting part. Or, for page
headers only, nudge it in code with `focal="50% 30%"` (lower % = show more of
the top).

Want to check a crop? Open the new file in VS Code. It previews images.

---

## Step 2: Use it

### Swap a Moments photo

In `content.ts`, find `MOMENTS`. Each entry:

```ts
{
  src: '/img/moments/yard',          // no -600.jpg on the end
  alt: 'Volunteers clearing cut branches…',  // what's IN the photo, for screen readers
  caption: 'Yard cleanup',            // the words on the photo
},
```

- The **first** entry is the big tile. Use a wide group shot, and make the
  1400 size too.
- Only 5 show. Extras are ignored.
- ⚠️ The captions describe only what's visible. Ask someone who was there
  for the real event name and date, then put them in (e.g. "Polar Plunge,
  Feb 2026").

### Add a photo header to another page

```astro
<PageHeader
  eyebrow="…"
  title="…"
  lead="…"
  image="/img/headers/my-page"
  focal="50% 35%"
/>
```

Leave `image` off and you get the original plain sand header. The header
photo is decorative (`alt=""`) because the title already says what the page is.

### Change a card photo

- Homepage: `image` and `alt` on that entry in `INVOLVEMENT` (`content.ts`).
- `/volunteer`: `image` and `alt` in the `roles` list at the top of
  `src/pages/volunteer.astro`.

---

## How the sign-up form works now

`/volunteer/apply`:

- **Role tiles.** Each role is a clickable tile with an icon. It's still a
  normal checkbox inside (the CSS `has-[:checked]:` turns the tile maroon when
  ticked), so keyboards and screen readers work as before.
  - The `name` / `value` of each checkbox **didn't change**. Emails and
    `/admin/submissions` look the same. Don't rename them.
  - `?role=driver` / `?role=coordinator` in the address still pre-ticks a tile.
    The "Apply" buttons on the role pages use this.
- **"What happens next."** Three steps beside the form on desktop, sticky as
  you scroll. On phones it moves **below** the form so the form comes first.
  Step 2 ("within a few days") must match the thank-you message in the same
  file. Change both together.
- **Phones:** tiles become compact rows, the photo is hidden, the button is
  full width.

The icons (`lucide-react`) are rendered on the server: no `client:`
directive, so no JavaScript is shipped for them.

`/contact` got the same card treatment, plus icon rows for phone/email/address
(tap-to-call and tap-to-email on phones) and a photo linking to the sign-up form.

---

## Gotchas

- **`.eyebrow` on a photo.** The small label above a title is maroon by
  default and invisible on a dark photo. The photo header sets its color
  inline (`var(--primary-on-dark)`), because `.eyebrow` beats Tailwind color
  classes. Same trap as the Support Us block.
- **Text on photos needs a scrim.** Every caption sits on a black gradient.
  If you add one, keep the gradient, or the white text disappears on light
  photos.
- **Consent.** Photo releases are signed for everyone in the gallery photos
  (2026-09-22). Any *new* photo needs the same before it goes up.

## Try it (exercises)

1. Swap the "Braving the cold" tile for a different gallery photo. Make the
   600/900 files with `npm run img`, change `src`, `alt` and `caption`.
2. Give `/faq` a photo header. Pick a photo, make the 16:7 files, add `image`.
3. Harder: the Moments grid always shows 5. Make it show 7 on desktop by adding
   a third row (`md:grid-rows-3`) and check it still looks right at 390px wide.
