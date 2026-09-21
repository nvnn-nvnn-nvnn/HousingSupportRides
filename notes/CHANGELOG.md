# Changelog

A running log of notable work. Most recent first. For *why* behind big
decisions, see [blog-cms-plan.md](./blog-cms-plan.md); for how-tos, see
[../how-to/](../how-to/).

## 2026-09-21

### Lightbox: arrow-key navigation

Left/right arrows now move between photos while the lightbox is open, across
both grids — `tiles` is `[...6 highlights, ...27 archive]` in DOM order, so it
behaves as one continuous gallery.

Built by following [../how-to/lightbox-navigation.md](../how-to/lightbox-navigation.md).
For how a photo reaches the dialog in the first place, see
[gallery-pipeline.md](./gallery-pipeline.md).

#### The shape

Two pieces of state and one entry point:

```
tiles     every [data-lightbox] button, in DOM order   — the list
current   index of the photo on screen                 — the bookmark
show(i)   the ONLY thing that assigns img.src
```

Clicks, arrow keys, and any prev/next buttons added later all call `show()`.
They differ only in which number they hand it. That is the whole design, and
it is why the key handler is two lines: it adds or subtracts one and trusts
`show()` to land somewhere valid.

`show()` and `open()` are deliberately separate — `open()` is `show()` plus
`dialog.showModal()`. Arrow keys need the first without the second, because
**`showModal()` throws `InvalidStateError` on an already-open dialog.**

#### Wrap, not clamp

```js
const n = tiles.length
i = (i + n) % n
```

Past the last photo you land on the first. Chosen over clamping because `tiles`
already spans a section boundary the user cannot see, so it is functioning as
one continuous sequence; asserting an endpoint that is invisible in the UI would
be arbitrary. Clamping would also mean disabling `#lb-prev`/`#lb-next` at the
ends — a button that silently does nothing is worse than either behaviour — so
it is not the one-liner it looks like.

Revisit this if a position indicator ("7 of 33") is ever added. Once people can
see where they are, silently teleporting them to the start reads as a bug.

⚠️ **The `+ n` is load-bearing, and this is the classic bug in this feature.**
JavaScript's `%` is *remainder*, not modulo — it keeps the sign of the left
operand, so `-1 % 33` is `-1`, not `32`. Without the `+ n`, pressing ← on the
first photo evaluates `tiles[-1]`, which is `undefined`, and the dialog goes
blank **with nothing in the console**. Test for it directly: open the first
photo, press ←, expect the last archive photo.

It also only survives being *one* step out of range, which is all the current
callers ever do. If something is added that can pass an arbitrary index — a
thumbnail strip, "press 5 for photo 5" — it needs the general form
`((i % n) + n) % n`.

#### Four bugs worth remembering, because three were silent

Found while wiring this up:

1. **A duplicate click handler.** The original inline `forEach` over
   `[data-lightbox]` was still present alongside the new `tiles.forEach`, so
   every tile had two listeners. Both fired: `open(i)` opened the dialog, then
   the old handler called `showModal()` on it again and threw. The *new* code
   looked broken when it was not. **When extracting logic into a function,
   delete the original in the same edit** — there is now only one
   `querySelectorAll('[data-lightbox]')` in the file, and that is the invariant
   to preserve.
2. **`dialog.modal()`** instead of `showModal()` — no such method.
3. **`querySelectorAll` without the `<HTMLButtonElement>` generic** returns
   `Element[]`, and `Element` has no `.dataset`, so `tile.dataset.src` will not
   typecheck. This script is TypeScript; the generic is not optional.
4. **`img.alt = tile.dataset.alt ?? ' '`** — a space, not an empty string.
   `alt=""` means "decorative, skip this"; `alt=" "` is a character some screen
   readers announce. Use `''`.

Only #2 produced a build error. The rest either failed at runtime or degraded
accessibility quietly.

#### Prev/next buttons — two traps found while wiring them

**Never call `addEventListener` inside another event handler.**

```js
// ✗ every keypress registers two MORE click listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') show(current + 1)
  prevBtn?.addEventListener('click', () => show(current - 1))
  nextBtn?.addEventListener('click', () => show(current + 1))
})

// ✓ registered once, in the straight-line body of the script
document.addEventListener('keydown', (e) => { … })

prevBtn?.addEventListener('click', () => show(current - 1))
nextBtn?.addEventListener('click', () => show(current + 1))
```

The outer handler runs on every keypress, so the inner registrations pile up and
nothing removes them. After twenty arrow presses one click on › calls `show()`
twenty times and jumps twenty photos. It degrades as the visitor browses, which
makes it look intermittent rather than wrong.

The rule that prevents it: **`addEventListener` is setup, not behaviour.** It
belongs in code that runs exactly once. If it sits inside something that runs
repeatedly, it is a leak.

**`?.` on a missing element fails silently.** `prevBtn` and `nextBtn` were being
queried before the `#lb-prev` / `#lb-next` markup existed, so both were `null`,
the optional chain swallowed it, and nothing attached — no error, no buttons, no
clue. Worth remembering that `?.` converts a wiring mistake into silence; when a
control does nothing at all, check the element was actually found before reading
the handler.

Note that [../how-to/lightbox-navigation.md](../how-to/lightbox-navigation.md)
Step 6 claims the skeleton already contains `#lb-prev` and `#lb-next`. **It does
not** — the dialog shipped with only zoom-out, zoom-in, and close. The markup has
to be written as well as wired.

#### Where the buttons go, and why

Siblings of `#lb-viewport`, inside the `<div class="relative">` that is the
positioning context — **not** children of the viewport. The viewport owns the
pointerdown/move/up handlers for drag-panning and pinch-zoom, and a button
inside it would compete with them for the same gestures.

`h-11 w-11` (44px) rather than the `h-9 w-9` of the zoom controls: 44px is the
accepted minimum touch target, and these are the primary navigation affordance on
a phone, where there are no arrow keys at all.

The glyphs are `‹` and `›`, not `<` and `>`. Raw angle brackets in text confuse
the Astro template parser.

The handlers are one line each — `show(current ± 1)`, identical to the arrow
keys. No bounds checking, because `show()` normalizes. That is the payoff for
routing everything through one entry point: a third input method costs two lines.

#### The naming contract: an `id` does nothing by itself

Every control in the lightbox is wired in **three steps, across two files-worth
of context**, and all three have to agree on one string:

```
MARKUP                          SCRIPT
id="lb-prev"   ←── matched ──→  querySelector('#lb-prev')
                                       ↓
                                prevBtn.addEventListener('click', …)
```

1. **Name it** — `id="lb-prev"` in the markup.
2. **Find it** — `querySelector('#lb-prev')` in the script.
3. **Give it behaviour** — `addEventListener` on what came back.

An `id` is only a name tag. It grants no behaviour and creates no connection;
it is useful solely because something else goes looking for that exact string.
Writing the id and the handler without the lookup agreeing between them gets you
a button that renders perfectly and does nothing.

This bit once: the markup said `Ib-prev` (capital i) while the script queried
`#lb-prev` (lowercase L). In most fonts those are the same glyph.
`querySelector` returned `null`, `prevBtn?.addEventListener` shrugged, and there
was no error anywhere — **asking for an element that does not exist is not a
failure in the DOM, it just returns `null`.**

When a control does nothing at all, check step 2 before suspecting the handler:

```js
console.log(document.querySelector('#lb-prev'))   // null means the names differ
```

It is the same contract the tiles already use — `data-lightbox` names them,
`querySelectorAll('[data-lightbox]')` finds them (see
[gallery-pipeline.md](./gallery-pipeline.md) Stage 5). Markup names things; the
script finds them by name; the name is the interface. Rename one side and the
feature goes quiet, not loud.

⚠️ Related trap in the same family: `?.` is what converts this from a crash into
silence. It is the right operator here — the script must not explode on a page
without a lightbox — but it means a wiring mistake produces no signal at all.

#### Lightbox captions — title and blurb over the photo

`title` and `blurb` now reach the dialog. Previously they existed on the grid
tile and stopped there, while `content.ts:274` claimed the blurb was "also shown
in the lightbox" — a comment describing an intention that was never built.

Same three-step naming contract as everything else here, run twice:

| Step | Where |
| --- | --- |
| Emit | `data-title` / `data-blurb` on the tile button, `GalleryGrid.astro` |
| Receive | `#lb-title` / `#lb-blurb` inside a `<figcaption>` in the dialog |
| Connect | read `tile.dataset.title/.blurb` in `show()`, write with `textContent` |

#### Five decisions, and why each went the way it did

**Overlay, not stacked.** The caption sits on the bottom of the photo behind a
`bg-gradient-to-t from-black/90 via-black/60 to-transparent` scrim, rather than
in a strip below it. Stacking would force the image to give back height from the
dialog's `max-h-[92vh]`, which hurts most on a phone in landscape where there is
least to spare. The overlay also matches the Hero's existing treatment, so it
reads as part of the site rather than a bolt-on.

**It fades above 1×.** `render()` sets `opacity: 0` whenever `scale > MIN_ZOOM`.
Someone who has zoomed to 4× is examining a face, and a paragraph across the
bottom is in the way; back at fitted size the context is welcome again. One line,
in a function that already ran on every zoom change, so it cost nothing.

**`pointer-events-none` is load-bearing.** The caption overlays the viewport. A
drag beginning anywhere in the bottom strip would otherwise land on the caption
instead of `#lb-viewport`, and panning would die in that region — an
intermittent-feeling bug that depends on where the user happens to grab. The
property lets pointer events fall straight through.

**The text is written inside `onReady()`, not beside `img.src`.** `textContent`
is synchronous; the image download is not. Setting the caption early paints the
new words over the *outgoing* photo for as long as the new one takes to arrive.
Deferring to the same callback that runs `measureBase()` keeps words and picture
in step.

**`textContent`, never `innerHTML`.** These are plain strings out of
`content.ts`. `textContent` keeps them incapable of injecting markup, which
matters more once the copy is being edited by someone other than a developer.

#### Markup change worth knowing

`<div class="relative">` became `<figure class="relative m-0">`. `<figcaption>`
is only valid inside `<figure>`, and the pairing is what lets a screen reader
associate the words with the image rather than announcing them as unrelated
text. The `relative` class is unchanged — it is still the positioning context
that the controls, the ‹ › buttons and now the caption all resolve against.

#### Side effect worth keeping

The feature makes the placeholder copy impossible to ignore: every photo except
the three marked `// ✓ reviewed` now shows "Placeholder title / Placeholder
caption — replace with what is happening here" across the bottom of the image.
That is a useful kind of visible, and it is already tracked as a launch blocker
alongside the alt text in [todo-next-steps.md](./todo-next-steps.md) § 7.

### Journal reset: one real post instead of four invented ones

Deleted `a-ride-that-changed-everything.mdx`, `from-shelter-to-keys.mdx`,
`volunteer-drivers-who-show-up.mdx` and `testing.mdx`. The first three were
fabricated client narratives — named people ("James", "Maria") with invented
circumstances, published as though they were reporting. That is the worst
category of placeholder the site carried: a visitor had no way to tell they
were not real, and a nonprofit caught inventing client stories loses more than
it could ever gain from having them.

Replaced with a single post: `recovery-picnic-2026.mdx`, dated 2026-09-05, for
the Recovery Picnic. Its body is **prompts rather than prose** — "lead with a
person or a moment", "name the volunteers once you have confirmed each is happy
to be named" — so nothing in it can be mistaken for finished copy. Cover is
`/img/cover.jpg`, the same group photo as the hero and the first gallery entry.

To hide it while it is being written: `draft: true` in the frontmatter. Drafts
are filtered out of `/journal`, the post routes, and the RSS feed.

#### Knock-on: the home page linked to three of the deleted posts

`FIELD_STORIES` in `content.ts` carries a `slug` per card and the "Read the
story" link resolves to `/journal/<slug>`. Three of those slugs pointed at files
that no longer existed, so all three would have 404'd. Repointed to a single
entry for the picnic.

**That broke the layout, which is worth knowing about.** `FieldStories` is a
3-column mosaic where the feature card carries `md:col-span-2 lg:row-span-2`.
With one story, `col-span-2` inside a single-column grid creates an *implicit*
second column and leaves a visible gap where the other cards used to be — CSS
grid does not clamp a span to the columns you declared. The component now
branches on `FIELD_STORIES.length === 1`: one story renders as a plain
full-width card, more than one returns to the mosaic. Adding a second post
restores the original layout with no further edits.

The same trap applies anywhere a span is hard-coded against a variable-length
list. If a grid ever shows phantom columns, look for a `col-span` larger than
the number of items can fill.

⚠️ Two strings still hold placeholder copy for this post and **they have to be
written together**: the `excerpt` in the post's frontmatter, and the `blurb` in
`FIELD_STORIES`. They are separate values and nothing keeps them in sync.

⚠️ `/img/cover.jpg` is the unoptimized 2 MB / 4080×3072 file in `public/`. It is
now the hero image, the first gallery entry, the social card source **and** this
post's cover, so optimizing it pays off four times over. See
[todo-next-steps.md](./todo-next-steps.md) § 1.

### Questions outstanding with the Executive Director

Everything still placeholder on the site now needs an answer from someone other
than a developer. The full list was delivered in-session; the short version of
what is blocked and where:

| Placeholder | Lives in | Status |
| --- | --- | --- |
| 1,850 housed / 24,000 rides / 76 partners / 610 volunteers | `IMPACT_STATS` | invented |
| Programs 89% / Fundraising 7% / Admin 4% | `BUDGET_SEGMENTS` + prose in `Transparency.tsx` | invented |
| Six supporter names, one reading "United Way (placeholder)" | `PARTNERS` | invented |
| Annual Report · 990 · Audited Financials · Board | `DOCUMENTS` | listed, all links dead |
| $25 / $60 / $150 / $400 impact claims | `DONATION_TIERS` | uncosted guesses |
| Rides are free; service area is "Saint Paul and surrounding" | `faq.astro`, marked `// CONFIRM` | unsourced |
| 501(c)(3) status and EIN | FAQ + `DonateBlock.tsx` TODO | unverified, already claimed |
| 2024 and "Today" milestones; board members | `history.astro` | empty |
| ~29 gallery alt texts and captions | `GALLERY_IMAGES` | `PLACEHOLDER_ALT` |
| Photo releases for identifiable faces | not a code issue | unknown |

The founding story, founder background, dated milestones and named events are
the largest gap — the history page is the one grantmakers read, and it is
currently the weakest page on the site.

**Standing principle for all of the above: a missing number is safer than a
wrong one.** Where an answer does not come back, remove the claim rather than
leave the placeholder standing in for it.

#### Still open

- ✅ The ‹ › on-screen buttons are in. Touch users can now navigate; arrow keys
  work; there is no visible affordance for navigation, which is a discoverability
  gap on touch devices where there is no keyboard at all. **Swipe or visible
  buttons should land before launch** — right now a phone user cannot move
  between photos without closing and reopening the dialog.
- Arrows navigate regardless of zoom level, and `resetView()` fits the new
  photo. The alternative (pan while zoomed, navigate only at 1×) was rejected:
  it makes the arrow keys mean two different things depending on state the user
  cannot see.
- `Lightbox.astro` is still the unused second implementation. This work went
  into the live inline version in `gallery.astro`, so the two have now diverged
  further — the component does not have navigation. Either port it or delete it;
  leaving both is the confusing option.

## 2026-09-20

### Logo assets, the social card, and why there is no vector logo

**The new logo is a raster image. There is no vector version of it.**

Three SVG exports out of Illustrator were tried (`NewLogoSVG.svg`,
`NewLogoSVG2.svg`, `NewLogoSVG2-01/02.svg`) and all four contained zero vector
paths. The linked variants were 463 bytes and reduced, in full, to:

```xml
<image width="1254" height="1254" xlink:href="newlogo.png" />
```

That is Illustrator reporting that the `.ai` document holds one placed PNG on
the artboard and nothing else. The embedded variant was the same thing with the
PNG base64'd inline, which is why it weighed 2 MB. This was not an export-settings
mistake — there was no vector art to export. Getting a true vector means redrawing
the mark or obtaining the original design source.

**Do not put a wrapped-raster SVG on the site.** Shipping the embedded one would
have loaded 2 MB on every page (the logo is in both the navbar and the footer)
in place of the current 43 KB, for zero quality gain — it is still a fixed
1254×1254 raster either way. The linked ones would render as a blank box, since
the browser resolves `newlogo.png` relative to the SVG.

For contrast, the *old* logo files are genuine vectors: `public/logo.svg` is
14 KB with 20 real paths. That is what a true export looks like, and it is the
quickest way to tell the two apart.

#### What each logo file is now

| File | What it is |
| --- | --- |
| `public/newlogo.png` | 320×320, 43 KB. **What the site serves** — navbar and footer. |
| `assets/newlogo-1254.png` | 1254×1254, 1.5 MB, transparent. Extracted from the embedded SVG; the highest-resolution copy of the new logo that exists. Source file, not served. |
| `assets/newlogo.png` | 1254×1254, 1.5 MB. The original Illustrator placed the artboard. |
| `public/logo.svg`, `public/HSRBlackSVG.svg` | The **old** logo, as real vectors. Still referenced nowhere; kept for reference. |

320px is not a shortcut: the logo renders at 48–96 px, so it is already past what
a 2× retina screen asks for. The site is not worse for the logo being raster.

#### The social card

`public/img/social-card.jpg` — 1200×630, 57 KB, the logo centred on the site's
ivory (`#fbf8f2`), generated from `assets/newlogo-1254.png` with sharp. Wired in
`BaseLayout.astro` as the default `ogImage`, so every page has a share image
without passing anything; a journal post can still override it with its cover.

Three constraints worth remembering if you regenerate it:

- **1200×630.** Facebook will not draw the large banner card much below ~600 px
  wide — it falls back to a small square thumbnail — and `twitter:card` is set to
  `summary_large_image`, which crops to roughly 2:1. A square logo loses its top
  and bottom.
- **Opaque, and a raster.** Transparent PNGs get composited onto each platform's
  own background and they disagree (Slack and Discord dark, Facebook white), so a
  logo tuned for one looks wrong on the other. And **SVG is rejected everywhere**
  for `og:image` — that was the original reason the SVG hunt was a dead end.
- **The URL must be absolute.** `new URL(ogImage, Astro.site)` handles that, which
  makes `site` in `astro.config.mjs` load-bearing for social previews, not just
  for the sitemap.

#### ⚠️ The logo and the site are different brands

The new logo is **navy blue and gold**. The entire site palette is **maroon** —
`--primary: #7f1416`, and the comment beside it in `global.css` still reads
"brand maroon (from logo)", which was true of the *old* logo and is not true of
this one. Nothing is broken, but a visitor sees a navy logo sitting on maroon
buttons and maroon section bands.

That is a decision, not a bug, and it is worth making deliberately before launch:
either restate the site palette around the logo's navy and gold, or accept the
mismatch, or revisit the logo. Whichever way it goes, fix the misleading comment
on `global.css` line 11.


### Program sections get their own "contact us" buttons

`/what-we-do` now ends each of the two formal program sections with an outline
CTA to `/contact`:

| Section | Button |
| --- | --- |
| Housing Support Program | Request housing support → |
| Transportation Support Program | Request a ride → |

Labels are per-program rather than a generic "Contact us," because someone who
has just finished reading what a program covers is at the moment of deciding
whether to ask for *that* thing. The label is set in the local `programs` array
in `what-we-do.astro`, **after** the `...DOC` spread so a future
`PROGRAM_DESCRIPTION` key named `cta` can't silently clobber it.

Community Support & Resource Navigation deliberately has no button — it is a
navigation/referral service rather than something you apply for, and the
page-level CTA below it already covers the general case.

**Not done:** the contact form has no topic field, so the buttons can't prefill
what the person is asking about (the volunteer form's `?role=` pattern has no
equivalent here). Adding a topic `<select>` to `contact.astro` and passing
`?topic=housing` / `?topic=rides` would let staff triage incoming messages
without reading each one first. Worth doing if inbound volume grows.

### Footer now leads with the badge; the old lockup kept as a colophon mark

`Footer.tsx` brand column renders `/newlogo.png` at `h-28`. The badge carries
its own gold rim and light interior, so it needs no filter on the near-black
footer (`--foreground`, `hsl(0, 10%, 15%)`).

**The old `logo.svg` stayed on the page, moved to the bottom strip** beside the
copyright line, at `h-9` with `opacity-50` and
`[filter:brightness(0)_invert(1)]`.

Two reasons for that treatment rather than dropping it in as-is:

- **Contrast.** `logo.svg` is maroon (`#7F1416` / `#7A121B`) plus off-white
  (`#F1F2F2`). At `h-9` on a near-black background the maroon portions would
  read as broken fragments. Flattening it to white keeps the shape legible;
  the opacity keeps it subordinate to the badge above.
- **Hierarchy.** Badge as the identity, original lockup as the colophon mark —
  a normal way to retain a legacy mark without implying two active brands.

It carries `alt=""` and `aria-hidden="true"`: the copyright line immediately
beside it already says "Housing Support Rides, Inc.", so a real alt would make
a screen reader announce the organization twice in a row.

Logo usage now: **navbar + footer brand = new badge; footer colophon =
`logo.svg`; `HSRBlackSVG.svg` = retained in `public/`, unreferenced.**

### New page: `/recovery-meetings` — weekly recovery meetings

Real, time-sensitive information supplied by the user: two standing weekly
meetings HSR hosts. New `src/pages/recovery-meetings.astro`, data in
`RECOVERY_MEETINGS` / `RECOVERY_CLOSING` in `content.ts`, and a `Meetings`
entry added to `NAV_LINKS` (second position, right after "What We Do").

| | Hnub Zoo Recovery | HSR Narcotics Anonymous |
| --- | --- | --- |
| Type | All Recovery | Narcotics Anonymous |
| When | Mondays, 5:30 PM | Saturdays, 6:30 PM |
| Where | 1440 Arcade Street, St. Paul, MN 55106 | 3207 Central Avenue NE, Minneapolis, MN 55418 |

**The layout is deliberately boring, and that's the point.** Someone may open
this page in a bad moment, so: day/time/address sit *above* the descriptive
prose on every card, nothing is behind an accordion or tab, and the address is
a tap-to-navigate Google Maps link rather than text to copy out. If you edit
the page, keep that order.

**Nav label is "Meetings," not "Recovery Meetings."** The desktop nav renders at
`lg:` with `gap-8` inside a 1200px container and now carries nine items; the
longer label risked overflow. "Meetings" is also the word people in recovery
actually use. The page's own `<h1>` is explicit, so nothing is lost for someone
who lands from search.

⚠️ **One unverified claim, marked `CONFIRM` in the page.** The "Need a ride to
a meeting?" block offers transportation to the meetings. Rides to recovery
meetings are **not** named in
[mission-and-programs.md](./mission-and-programs.md), which lists medical,
housing, employment, benefit and food appointments. HSR hosts these meetings so
it's plausible, and the wording is hedged ("we will do what we can") rather than
a guarantee — but confirm with the director or delete the block.

#### Not done, deliberately

- **No crisis-line information.** A page about addiction, mental health, grief
  and trauma is a reasonable place for the 988 Suicide & Crisis Lifeline, but
  what safety resources a nonprofit publishes is the organization's call, not a
  default. Offered to the user; not added.
- **No `Event` structured data.** Recurring-event schema would make these
  meetings eligible for rich results when people search for meetings nearby —
  worth considering given the page's purpose. The site already emits NGO schema
  in `BaseLayout.astro`, so the pattern exists.
- **No footer link.** The footer's "Programs" column maps every label to
  `/#our-work` rather than to real routes, so adding one entry properly would
  mean restructuring that column.

### Navbar logo swapped to the new circular badge (old logo kept)

`Navbar.tsx` now renders `/newlogo.png` — the circular navy-and-gold badge
(hands forming a heart over a house and a van, "PEOPLE · TRANSPORT · HOUSING ·
BRIGHTER TOMORROWS" around the rim). **The old logo was not removed**: the
footer still renders `logo.svg`, and `HSRBlackSVG.svg` remains in `public/`
and still ships, just unreferenced.

Where the files ended up:

| File | Role |
| --- | --- |
| `assets/newlogo.png` | 1254×1254 master, **not served** — lives with the other brand masters |
| `public/newlogo.png` | 320×320, 43 KB — what the site actually loads |
| `public/logo.svg` | old logo, still used by the footer |
| `public/HSRBlackSVG.svg` | old navbar logo, retained, no longer referenced |

**It was in the gallery — and was being rendered as one of the photos.** The
file sat at `src/assets/img/gallery/`, inside the gallery's `import.meta.glob`
path, and `GALLERY_IMAGES` had a real entry for it (committed in `2e477ba` as
`IMG_20260920_024743.png`, later renamed to `Newlogo.png` on disk). So the logo
was appearing in the public gallery as an event photo, captioned "Placeholder
title" with placeholder alt text.

Moving the file out left that entry dangling, which surfaced as a maroon
"Missing file:" tile — the fallback in `GalleryGrid.astro` doing exactly its
job. The entry has been deleted from `content.ts`.

**The gallery count was therefore wrong in earlier notes.** It was described as
33 photos; it was 32 photos plus the logo. Now 32 entries, 32 files on disk,
0 missing tiles — verified in the built output.

⚠️ **It was 1.5 MB at 1254×1254**, and the navbar displays it at 48–56 px. That
is exactly the trap in [../how-to/images.md](../how-to/images.md): a raster in
`public/` is served untouched, so every visitor on every page would have
downloaded 1.5 MB to fill a 56 px box. Resized to 320 px (enough for 3× DPR)
via sharp → **43 KB, a 97% reduction.** Regenerate from the master if the
display size ever changes.

**Sizing changed too.** The old mark was a horizontal wordmark at `h-9 md:h-10`.
A circular badge reads much smaller at the same height, so it is now
`h-12 md:h-14`. The header is a fixed `h-[76px]` — **do not exceed `h-14`** or
the logo will crowd or overflow the bar.

#### Open questions raised by the new logo (not acted on)

- **It clashes with the maroon theme.** The badge is navy + gold; the site
  palette is maroon (`--primary: hsl(359, 73%, 29%)`, derived from the previous
  logo's `#7f1416`) and was chosen deliberately. Navy/gold next to maroon reads
  as two brands. Either the palette follows the logo, or the logo is treated as
  a seal used sparingly. A decision, not a bug.
- **The rim text cannot be read at 56 px** — inherent to badge logos in
  navbars. Fine if treated as a mark rather than a wordmark, but it means the
  header no longer spells out the org name anywhere.
- **There is a visual artifact in the source image** — a red/yellow/black smudge
  in the lower middle, behind the hands. Looks unintentional; worth checking
  against the original artwork before launch.
- **The favicon still uses the old mark** (`public/favicon.svg`), as does the
  footer. If the badge is now the identity, those want updating for consistency.

### Admin accounts: researched, documented, deliberately not built

New: [../how-to/admin-accounts.md](../how-to/admin-accounts.md). **No code.**
The user is writing this themselves and asked for a study guide, so the doc is
concepts, shapes and exercises — it contains no paste-ready implementation on
purpose.

The question was whether admins could log in from inside the site without each
needing a GitHub account, "like Eleventy does."

**The answer turns on a mechanic worth writing down.** Keystatic is a git-based
CMS: there is no content database, so every save must become a commit, and
GitHub only accepts commits from an authenticated identity. That leaves exactly
two shapes — each editor authenticates as themselves (what we have), or a
server holds one token and commits on everyone's behalf (a **token broker**).
Every "in-site login, no GitHub" product is the second shape with the broker
hosted by someone else.

**The Eleventy memory is the deprecated path.** That setup was Decap CMS +
Netlify Identity + **Git Gateway**, where Git Gateway was the broker. Netlify
has deprecated Git Gateway; existing sites work, new ones are discouraged.
Netlify Identity itself was un-deprecated in Feb 2026, but the CMS-through-Git-
Gateway workflow specifically is on borrowed time. Recommended instead:
**Keystatic Cloud** — same broker role, maintained, one `storage:` line, free
to 3 users.

**Two separate logins, not one.** Editing content (git, commits, low stakes)
and viewing form submissions (database, PII, real stakes) are different
problems and should not share an implementation until the tradeoff is
understood. Today nothing stores submissions — Web3Forms emails them and keeps
nothing — which is a better privacy position than a dashboard would be, and
worth noticing before giving it up. For a transport org touching NEMT, a stored
ride manifest is health information in all but name.

**Correction recorded:** Better Auth was described to the user as a "managed
provider" while scoping. It is not — it's a self-hosted library, and we would
hold the password hashes ourselves. Clerk/WorkOS are the managed option. The
distinction changes who owns a breach, so it's called out in the guide too.

⚠️ **Astro-specific trap documented:** no `output` is set in
`astro.config.mjs`, so pages prerender by default and middleware does not run
for them. A protected page missing `export const prerender = false` ships as
public static HTML — no error, no warning, and a login form that appears to
work. The reliable check is whether the page lands in `dist/` after a build.

### Placeholder content: decided "hide, don't fill" — deferred

Recorded in [todo-next-steps.md](./todo-next-steps.md) § 5. Before launch, most
placeholder content gets *removed from the page* rather than filled with
invented numbers: an absent stats band reads as a young organization, a
fabricated one is a checkable claim. Explicitly **not now** — placeholders keep
layouts honest about their spacing while the site is still being built.

Flagged for whoever does that pass: emptying the arrays in `content.ts` is the
obvious lever, but whether each section actually *hides* versus rendering an
empty shell is unverified. Check per section rather than assuming.

### `how-to/gallery-page.md` rewritten to match the shipped code

The guide had drifted. It still described an earlier design where
`GalleryGrid` took a `resolve` prop and did its own lookups, and it referred to
`GALLERY_PHOTOS`, which is actually `GALLERY_IMAGES`. A teaching doc that
contradicts the code you're reading is worse than no doc, so Steps 2 and 3 now
mirror `gallery.astro` and `GalleryGrid.astro` exactly.

Substantive additions, all from questions that came up while reading the code:

**Three things with confusingly similar names.** The single biggest source of
confusion in the resolve block is that `photo`, `files[key]` and `img` sound
interchangeable:

| In the code | What it is |
| --- | --- |
| `photo` | the **data entry** from `content.ts` — words only, no module |
| `files['…/x.jpg']` | the **module**, shaped `{ default: … }` |
| `img` = `files[key].default` | the **metadata**, one level past the module |

**The image bytes are never in JavaScript.** `img` is not a picture, it's
`{ src, width, height, format }` — a pointer plus dimensions. The file stays on
disk. This is also *why* `<Image>` wants the metadata object rather than a URL
string: knowing the intrinsic size up front is what lets Astro pick `srcset`
entries and stamp `width`/`height` so the page doesn't jump.

**`...photo` is the moment the two halves combine.** The spread copies the five
content fields in; `img` and `fullSrc` are added alongside. That returned shape
*is* `GalleryItem` — and the `&` in `GalleryPhoto & { img; fullSrc }` is the
type-level version of the same operation. Worth stating plainly because the
value and the type are written in two different files.

**Why `async` / `Promise.all`.** `getImage()` really does resize a file, so it
returns a Promise; awaiting forces the callback `async`, which makes `.map()`
yield Promises rather than objects. `Promise.all` collapses them back — and
because all 33 are started before any is awaited, they process in parallel. All
at build time; visitors never wait.

Also added a short **"Adding a photo once this is built"** section near the top:
two manual steps (drop the file in, add the entry), two automatic ones. It
calls out explicitly that you never `import` a photo individually, and that
annotating in `content.ts` comes *before* resolving — `content.ts` is the
input, not the output.

⚠️ Restated in the guide: every entry in `GALLERY_IMAGES` currently shares the
date `2026-09-20`, so the sort is a no-op and the Highlights/Archive split is
arbitrary until real per-photo dates land.

### Gallery: Highlights/Archive grid + a zoomable lightbox

`/gallery` went from a static placeholder grid to real photos with a custom
lightbox. New: `src/components/GalleryGrid.astro`, photos in
`src/assets/img/gallery/`, and `GalleryPhoto` / `GALLERY_IMAGES` /
`HIGHLIGHT_COUNT` in `content.ts`.

**Photos live in `src/assets/`, not `public/`** — that is what lets Astro
optimize them at all. The cost is that you cannot build an import path out of a
variable, so `gallery.astro` uses `import.meta.glob` with a *literal* pattern
that Vite resolves at build time into a path→module map. The pattern cannot be
a variable either; that restriction is the whole mechanism.

**The split is driven by `date`, not a `section: 'highlight' | 'archive'` flag.**
Sort newest-first, slice at `HIGHLIGHT_COUNT`. Adding a photo automatically
demotes the oldest out of Highlights — nothing to remember to update by hand.
ISO `YYYY-MM-DD` sorts correctly as a plain string, so `localeCompare` is
enough and no `Date` parsing is involved.

#### Two renders per photo, and two size traps worth knowing

Each photo is rendered twice, because the grid tile and the lightbox need very
different things: the tile needs to be small, the lightbox needs enough pixels
to survive being zoomed to 5x.

1. **Tile** — `<Image widths={[400, 800]}>` in `GalleryGrid.astro`.
2. **Lightbox** — `await getImage({ src: img, width: 2000, format: 'webp', quality: 72 })`
   in `gallery.astro`, handed to the tile as `fullSrc`.

Both calls carry a parameter that looks redundant and is not:

- **`quality: 72` is explicit on purpose.** `getImage()` defaults to a quality
  high enough that a 2000px WebP re-encoded from a 4000px phone photo can come
  out **larger than the original JPEG** — you do the work of optimizing and ship
  a bigger file. Any time a render is unexpectedly heavy, check this first.
- **`width`/`height` are pinned on `<Image>`, not just `widths`.** Given only
  `widths`, Astro renders the plain `src` fallback at the source image's *full*
  size. Our sources are ~4000px multi-megabyte phone photos, so every client
  that ignores `srcset` would download one. Pinning `width` makes the fallback
  the 800px render.

Both are documented in [../how-to/images.md](../how-to/images.md) §"Two sizing
traps that cost real megabytes."

**A filename in `content.ts` with no matching file renders a visible
"Missing: …" tile** rather than failing the build. A typo shows up as an
obvious red square instead of a silent blank or a broken deploy.

#### The lightbox

Native `<dialog>` + `showModal()`, which buys Escape-to-close, focus trapping,
and an inert background for free. Three things that would otherwise cost an
afternoon each:

- **`m-auto` on the dialog is load-bearing.** A modal `<dialog>` is centered by
  the UA stylesheet's `margin: auto`, and **Tailwind's preflight sets
  `margin: 0` on every element**, clobbering it. Without `m-auto` the dialog
  pins to the top-left corner. This bites every `<dialog>` in a Tailwind
  project.
- **Zoom is `transform: translate() scale()` with hand-rolled panning** —
  drag on pointer, pinch on touch, wheel-to-zoom at the cursor, and a
  `clampPan()` that stops the photo's edges coming inside the frame. The
  zoom-at-a-point maths is derived in a comment above `zoomTo()`.
  ⚠️ **This supersedes the "Adding zoom" section of
  [../how-to/gallery-page.md](../how-to/gallery-page.md)**, which recommends
  zooming by changing the layout `width` so an `overflow-auto` parent gives you
  panning for free. That approach works, but it means scrollbars and a
  scroll container fighting the modal; the shipped version does the panning
  itself and keeps `overflow-hidden`. Treat the how-to's Step 4 zoom snippet as
  the older design.
- **Measure the fitted size inside `requestAnimationFrame` after `load`.**
  Measuring right after setting `img.src` captures the *previous* photo's
  dimensions. The view also resets on `close`, so a photo never opens at the
  last one's zoom level.

#### Content status

Three entries in `GALLERY_IMAGES` are marked `// ✓ reviewed` and have real alt
text, titles, and blurbs. **Everything below that divider has real files but
placeholder `alt`/`title`/`blurb`** — the alt text especially, since that is an
accessibility issue and not just unfinished copy.


### Gallery wired to the real photos (optimized, Highlights/Archive)
- `GALLERY_IMAGES` now holds **33 entries** keyed by bare filename (`file`),
  resolved through `import.meta.glob` — the workaround for "you can't build an
  import path from a variable." Added `HIGHLIGHT_COUNT = 6`.
- New `src/components/GalleryGrid.astro`, used twice (Highlights, then a denser
  Archive). A filename with no matching file renders a visible "Missing file:"
  tile rather than failing silently.
- `cover.jpg` copied into the gallery folder so the glob can see it; the hero
  still serves its own copy from `public/`.
- **Optimization is now real:** `cover.jpg` 1960 kB → **39 kB** at thumbnail
  size; the stray 1.5 MB PNG → **43 kB**. Thumbnails are lazy-loaded.

⚠️ **Most alt/title/blurb text is PLACEHOLDER.** Three entries are real
(reviewed); the other 30 say "Placeholder —". Shipping those `alt` strings
would be an accessibility failure. Consent is still unconfirmed — see below.

**Two image-sizing traps worth remembering** (both cost real megabytes):

1. **`<Image widths={[...]}>` without `width`** makes the plain `src` fallback
   a render at the source's *full* size. Our 4080px phone photos produced a
   **3 MB** fallback per image — downloaded by anything that ignores `srcset`.
   Setting `width`/`height` explicitly pins the fallback to the 800px render
   (3000 kB → 164 kB).
2. **`getImage()` default quality is high.** A 2000px WebP off a 4080px source
   came out *larger than the original JPEG*. Pass `quality` explicitly (we use
   72 for the lightbox render).

Together these took the generated image output from **28 MB → 16 MB**.

### 32 real event photos moved into `src/assets/img/gallery/`
Photos landed in the repo-root `assets/` folder, which **Astro ignores** — it's
neither `public/` (served as-is) nor `src/` (optimized). Nothing there reaches
the site. Moved them to `src/assets/img/gallery/` so `astro:assets` can process
them. 32 files, 19 MB (31 jpg + 1 png).

**Nothing is published yet.** The files are unreferenced, so Astro doesn't even
bundle them and the build output is unchanged. They go live only when added to
`GALLERY_IMAGES` in `content.ts`.

⚠️ **Consent is an open question, and it's the blocker here.** The photos show
identifiable faces at recovery-related events (a Walk for Recovery gathering, a
"Recovery Is Everywhere" story banner, volunteers setting up a venue). Someone's
recovery status is health information — publishing a photo that identifies a
person as being in recovery without informed consent is a real privacy problem,
and for an org that *serves* this population it's a trust problem too. Confirm
photo releases before any of these are wired into the gallery.

Also still to do for these:
- **Rename them.** `IMG_20260920_024632.jpg` doesn't scale as a data key.
- **Alt text** for each.
- **Mixed aspect ratios** — 23 are 4:3, 4 portrait (3:4), 4 at 16:9, 1 square.
  The grid's `aspect-[4/3]` + `object-cover` crops portraits hard (fine for
  thumbnails; the lightbox shows them whole). Same issue applies to the hero
  carousel — see [../how-to/hero-carousel.md](../how-to/hero-carousel.md).
- **`IMG_20260920_024743.png`** is a 1.5 MB PNG of a photo — wrong format;
  Astro converts it automatically now that it's under `src/`.

Left alone deliberately: `cover.jpg` still serves from `public/img/` as the hero
(2 MB, unoptimized). Moving it means reworking `Hero.tsx`, which is React and
can't use `<Image />` — needs the `getImage()` workaround in
[../how-to/images.md](../how-to/images.md). Separate job.

### Gallery lightbox: centered, and zoomable
- **Centering fix.** The lightbox was pinning to the top-left corner. Cause:
  **Tailwind's preflight sets `margin: 0` on every element**, which overrides
  the UA stylesheet's `margin: auto` that normally centers a modal `<dialog>`.
  Fix is one class — `m-auto` on the dialog. Worth remembering: any `<dialog>`
  in this project needs it.
- **Zoom added**, then **reworked to zoom-at-cursor** (no scrollbars), which is
  how image lightboxes normally behave:
  - **Wheel** zooms toward the pointer; **pinch** zooms toward the midpoint.
  - **Drag** to pan; **click the photo** toggles fitted ↔ 2.5x anchored where
    you clicked; clicking the space *around* the photo closes.
  - `+` / `−` buttons zoom about centre (1x–5x). Buttons disable at the limits,
    and the view resets on close so a photo never opens at the last one's zoom.
- **Implementation note — the approach changed.** The first version resized the
  image's **layout width** so an `overflow-auto` container could scroll to pan.
  That works, but it means scrollbars and it can't anchor zoom to the cursor.
  Now it's `transform: translate(tx,ty) scale(s)` on an `overflow-hidden`
  viewport, with pan done by dragging. Keeping the point under the cursor fixed
  while scaling is one formula — with `u` = cursor measured from the photo's
  centre: `t2 = u - (u - t) * (next / scale)`. Panning is clamped so the photo's
  edges can't come inside the frame (and at 1x that pins it back to centre).
- Guide updated to match: [../how-to/gallery-page.md](../how-to/gallery-page.md) § lightbox.

### Real mission + program copy replaces the placeholder draft
The organization's official program description (mission, Housing Support
Program, Transportation Support Program, community support / resource
navigation, charitable purpose) landed. Rather than paste it page by page, it
went into `src/lib/content.ts` as **one source of truth**:

- **`MISSION`** — three registers of the same message so the site, a grant
  summary, and a social bio never drift apart:
  - `.short` — one line. Doubles as the site-wide `<meta description>` and as
    the Instagram/Facebook bio.
  - `.statement` — the official two-sentence mission, verbatim.
  - `.purpose` — the "what we provide" paragraph: *"Providing a trustworthy
    community, stable housing, and reliable transportation — the three things
    people need at the same time, not one at a time. Together we make sure a
    missing ride never costs someone their home, their health, or their job."*
- **`CHARITABLE_PURPOSE`** — the 501(c)(3) "in furtherance of its charitable
  purposes / not for private benefit" language, **verbatim**, as a two-element
  array so it renders as the two paragraphs it is. The wording donors, the IRS,
  and grant reviewers look for — do not reword it.
- **`PROGRAM_DESCRIPTION`** — the entire program description transcribed
  verbatim and structured for rendering: the opening paragraph, each program's
  plain-language description *and* its formal description + activity list, the
  Community Support and Resource Navigation paragraph, and Overall Purpose.
  `/what-we-do` renders it in document order, so the page **is** the document.
- **`PROGRAMS`** (the home-page cards) is now the three real programs, not four
  invented ones — Housing Support Program, Transportation Support Program,
  Community Support and Resource Navigation. Card bodies are verbatim sentences;
  `details` point at the verbatim activity arrays. `OurWork` went 2×2 → 3-up.
  The `#housing` / `#rides` / `#community` anchors still resolve; `#support`
  is gone (it was never a real program).

**The rule this establishes:** mission and program text on the site is the
organization's own wording, not a marketing rewrite of it. The one deliberate
exception is `MISSION.purpose`, a short plain-language line used as a pull quote
on the home page and nowhere load-bearing.

Where each field surfaces:

| Where | Field |
| --- | --- |
| `<meta description>` + social previews, every page | `MISSION.short` |
| `/what-we-do` + `/history` mission blocks, JSON-LD | `MISSION.statement` |
| Home "How We Help" intro, `/what-we-do` mission block | `MISSION.purpose` |
| Home "Where the Money Goes", `/what-we-do` charitable-purpose section | `CHARITABLE_PURPOSE` |

Pages touched: `Hero.tsx` (subhead now names the three barriers),
`OurWork.tsx`, `Transparency.tsx` (charitable-purpose statement sits beside the
financial documents — the "not for private benefit" line is what a cautious
donor wants there), `what-we-do.astro` (mission block + new Charitable Purpose
section), `history.astro` (mission block + a real 2023 founding milestone),
`faq.astro` (6 placeholders → 10 real answers), `volunteer.astro`,
`Footer.tsx` (program names synced; mission blurb replaces the narrower
"non-emergency medical transport" framing).

### SEO: schema.org NGO structured data
`BaseLayout.astro` now emits a JSON-LD `NGO` block (name, mission, address,
phone, email, service area). This is what feeds a Google knowledge panel and the
nonprofit treatment in search results — worth having before launch, not after.

### Removed an unverified third-party claim
The hero's "Charity Navigator 4-Star · 89 cents of every dollar goes to
programs" was placeholder copy asserting a real third party's rating. Replaced
with "A nonprofit charitable organization serving Saint Paul, Minnesota."
⚠️ The **89 / 7 / 4 budget split is still placeholder** in `BUDGET_SEGMENTS` and
in the `Transparency.tsx` paragraph, and all four `IMPACT_STATS` are
placeholder — both are stated as fact on the live site. See
[todo-next-steps.md](./todo-next-steps.md) § 5.

### Two FAQ answers need confirming
`faq.astro` has `// CONFIRM` comments on the two answers that aren't in the
program description: that rides are free, and that the service area is "Saint
Paul and surrounding communities." Both are reasonable, neither is sourced.

### New: `notes/mission-and-programs.md`
The official program description, **reproduced verbatim** — both halves (the
plain-language "Program Description" and the formal "Mission and Program
Confirmation"). It is the source of truth: the site copy derives from it, and
where the two disagree, the document wins. It also draws the line we now hold —
anything the site asserts that *isn't* in that document (impact numbers, budget
split, service area, whether rides are free) is unverified and flagged in
[todo-next-steps.md](./todo-next-steps.md) § 5.

Docs: [../how-to/editing-the-site.md](../how-to/editing-the-site.md) gained a
"Change the mission statement" section with the same field→location table.

## 2026-09-16

### Web3Forms integration: Contact + a unified Volunteer intake form
- Verified the exact current Web3Forms AJAX API before writing code (endpoint,
  JSON payload shape, `botcheck` honeypot) rather than guessing.
- New `src/lib/web3forms.ts` — shared `initWeb3Form(form, statusEl)` handler:
  submits via fetch (no page reload), shows inline success/error text, honors
  the honeypot, disables the button while in flight. Gated on
  `WEB3FORMS_ACCESS_KEY` in `content.ts` (empty by default → friendly
  "not connected yet" message, same pattern as Givebutter/Hero image).
- **`/contact`** — the form (previously `onsubmit="return false"`, fully
  inert) now actually submits.
- **New `/volunteer/apply`** — one shared intake form (name/email/phone +
  "how would you like to help?" checkboxes + notes) instead of a form per
  role. Chosen because: simpler to maintain, one inbox for staff to triage,
  and role-specific vetting (license, background check) belongs in the
  follow-up conversation, not the web form. Supports `?role=driver` /
  `?role=coordinator` to pre-check the matching box.
- `become-a-driver.astro` / `help-coordinate.astro` CTAs now point to
  `/volunteer/apply?role=…` instead of the generic `/contact`. `give-monthly`
  intentionally untouched — it already correctly goes to `/#donate`.
- Setup: [../how-to/deploying.md](../how-to/deploying.md) → "Connecting Web3Forms."
- Also fixed several stale spots found while updating notes for this: wrong
  adapter name, wrong Keystatic mode, dead `BrandMark` reference, outdated
  Hero description, `master`→`main` branch name — across README.md,
  component-responsibilities.md, and folder-structure.md. Flagged (not
  deleted): `src/components/layout/Header.tsx` is a 0-byte unused file.

## 2026-09-15

### Givebutter donation integration
- Wired real donation processing via **Givebutter** (custom-element widgets:
  https://docs.givebutter.com/widgets/getting-started).
- `src/lib/content.ts` — new `GIVEBUTTER_ACCOUNT_ID` / `GIVEBUTTER_CAMPAIGN_CODE`
  config (both empty by default; nothing loads/renders as active until set).
- `BaseLayout.astro` — conditionally loads Givebutter's widget script
  (`widgets.givebutter.com/latest.umd.cjs?acct=...`) site-wide once configured.
- `DonateBlock.tsx` — the CTA button (previously **completely inert**, no
  href/onClick) now renders a real `<givebutter-button>` that opens Givebutter's
  checkout popup when configured, or a clearly-disabled placeholder otherwise.
  Our tier-selector/impact-copy UI is unchanged — it now leads into a real
  payment flow instead of a dead end.
- `src/types/givebutter.d.ts` — TS declarations for the custom elements. Note:
  **React 19 requires `class` (not `className`) on true custom elements** for
  styling to apply — documented there and in how-to/deploying.md.
- Setup steps for connecting a real account: how-to/deploying.md → "Connecting
  Givebutter (donations)".
- Not yet confirmed: whether the selected $ amount can be passed into
  Givebutter's popup (no documented preset param found) — currently the donor
  chooses/confirms the amount inside Givebutter's own checkout.

## 2026-09-01

### ⚠️ Vercel deploy fix — adapter (IMPORTANT)
**Vercel was not working because the adapter was `@astrojs/node`.** Vercel cannot
serve the Node adapter's standalone server — it needs `@astrojs/vercel`, which
emits `.vercel/output/`. A Node-adapter build looks green but the site is broken.
- Installed `@astrojs/vercel`; `astro.config.mjs` now `adapter: vercel()`.
- Fixed the Keystatic repo string to the real repo
  `devvdevvdevv/HousingSuportRides` (note: repo name misspells "Support").
- Added `.vercel` to `.gitignore`.
- **Still required for `/keystatic` in prod:** set `KEYSTATIC_GITHUB_CLIENT_ID`,
  `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` in Vercel env vars, and
  push to GitHub `main` (Vercel deploys from there). Full steps + the adapter
  gotcha are in [../how-to/deploying.md](../how-to/deploying.md).

### Mobile fixes: navbar drawer + logo size
- Mobile drawer was rendering transparent/collapsed because the `fixed` overlay
  lived inside `<header>`, whose `backdrop-blur` (a `backdrop-filter`) creates a
  containing block for fixed children. Moved the overlay to be a **sibling of
  `<header>`** and gave it a solid `bg-[#e5e5e5]`.
- Navbar logo was `h-32` (128px) on mobile — shrank it to `h-9 md:h-10`.
- Hero text no longer clips into the image (text column constrained to the left
  half; image set to `md:w-1/2`).

## 2026-08-29

### Hero overlap fix + multi-editor CMS setup
- **Hero:** text no longer clips into the image. Constrained the text column to
  the left half (`md:w-1/2 md:pr-10`) and set the image to `md:w-1/2` — since the
  container is centered, the text's right edge now lands exactly at the midpoint
  where the image begins. (Dropped the old `lg:w-[52%]` that caused the overlap.)
- **Multiple editors / news admin:** `keystatic.config.tsx` now uses local mode
  in dev and **GitHub mode in production** (`import.meta.env.DEV` guard), so
  several people can sign in at `/keystatic` and each save becomes a commit.
  Editor access = GitHub repo write access. TODO: set `repo: 'OWNER/…'`, install
  the Keystatic GitHub App, set env vars, deploy with an adapter — steps in
  how-to/deploying.md ("Multiple editors"). Keystatic Cloud is the option for
  editors without GitHub accounts.

### Real org details from the NPI registry (NPI 1801751094)
- Applied the official record: legal name **Housing Support Rides, Inc.**,
  address **917 Edmund Ave, Saint Paul, MN 55104**, phone **(763) 501-7764**,
  Executive Director **Kong Meng Vang** (added to the History page), and the
  registered service **Non-emergency Medical Transport (VAN)** — worked into the
  Rides program copy. Footer/contact updated; footer now shows NPI 1801751094.
- **Removed the fabricated "501(c)(3) · EIN 45-2810394" claim** from the donate
  block and footer (template placeholder). Left a TODO: confirm 501(c)(3) status
  and add the real EIN before accepting donations / claiming tax-deductibility.
- Note: NPI was enumerated 2025-12-19; founding kept at 2023 per the user.

### "What We Do" page + founding year fix
- Added `/what-we-do` — expands each program with detail bullets, re-states the
  impact numbers with context, and ends with a CTA. `PROGRAMS` in content.ts
  gained `slug` + `details`.
- Home "Our Work" cards' "Learn more" now deep-link to `/what-we-do#<slug>`;
  the nav item "Our Work" was renamed **What We Do** and points to the page.
- Corrected the founding year **1997 → 2023** (hero eyebrow, footer, and the
  History timeline, now 2023 / 2024 / Today).

### Dedicated pages for each involvement path
- Added `src/pages/volunteer/become-a-driver.astro`, `help-coordinate.astro`,
  and `give-monthly.astro` — each a full page (PageHeader + role details + CTA).
- The `/volunteer` cards are now clickable links to those pages, and the home
  "Get Involved" CTAs point at them too (`INVOLVEMENT[].href` in content.ts).
  Give Monthly's CTA leads to `/volunteer/give-monthly`; its page CTA → `/#donate`.

### Content pass: watershed → Housing Support Rides
Replaced all the leftover clean-water/Riverbend copy with Housing Support Rides
placeholder content (housing, rides, support, community, resources, reintegration).
- **content.ts** — new impact stats (neighbors housed, rides provided…), four
  programs (Housing Placement, Rides & Transportation, Support & Case Management,
  Community & Resources — new lucide icons Key/Car/Handshake/Users), donation
  tier impacts, involvement routes (+ per-route `href`), partners.
- **Sections** — Hero headline/subline/eyebrow/trust + image alt; OurWork title
  ("How We Help"); FieldStories heading; DonateBlock custom-impact line;
  Transparency paragraph; Newsletter subline.
- **Footer** — mission "Housing. Rides. Belonging.", program/involve links,
  neutral placeholder address, and the orange link → "Need a ride or support?"
  (LifeBuoy icon) pointing to /contact.
- **Blog** — removed the 3 watershed posts; added 3 new placeholder stories
  (a-ride-that-changed-everything, from-shelter-to-keys,
  volunteer-drivers-who-show-up). Keystatic categories + RSS description updated.
- **GetInvolved CTAs** now use each route's own `href` (no longer all → donate).
- Removed the now-unused `BrandMark` component. `BaseLayout` default description
  + contact page address updated.
- Still placeholder throughout — swap in real numbers, names, and consented
  stories before launch. The `testing.mdx` post is still present.

## 2026-08-15

### Brand logo + maroon theme + formatting pass + Contact page (release prep)
- **Logo.** Added `public/logo.svg` (from `assets/HousingSupportRidesLogoSVG.svg`)
  and replaced the text wordmark in the Navbar and Footer with it (Footer uses a
  `brightness-0 invert` filter so it reads on the dark background). `BrandMark`
  component is now unused.
- **Color scheme → maroon**, built from the logo's own color. `--primary`
  = `#7f1416` (deep oxblood maroon, hsl 359/73/29), warm near-black text, and a
  pale warm-sand `--accent-soft` (deliberately not pink). Renamed `--rb-teal`
  → `--rb-maroon`; updated the `MediaPlaceholder` gradient, FieldStories scrim,
  and OurWork shadow to warm/maroon. Orange donate accent kept.
  (Note: an earlier rose-leaning maroon was reverted first, then redone.)
- **Shared `PageHeader.astro`** — one consistent header (eyebrow + title + lead)
  now used by Volunteer, History, FAQ, Contact, and the Journal index (which had
  its own bespoke header + stale "watershed" copy, now neutral "News & Stories").
- **New `/contact` page** with a placeholder form (name/email/phone/message).
  Form is inert (`onsubmit="return false"`) — TODO: wire to web3 intake.
- **Navbar links** bumped to `font-medium`. Contact added to `NAV_LINKS`.

### Added standalone pages: Volunteer, History, FAQ
- `src/pages/volunteer.astro` (`/volunteer`) — renamed/fixed from a draft
  `getInvolved.astro` (it was missing the `---` frontmatter fences and had the
  wrong import depth). Skeleton with a ways-to-help grid.
- `src/pages/history.astro` (`/history`) — skeleton with a placeholder timeline.
- `src/pages/faq.astro` (`/faq`) — native `<details>` accordion (no JS), seeded
  with placeholder rides-org Q&A.
- Nav (`NAV_LINKS` in `content.ts`) now: Our Work · Impact · Volunteer · History ·
  FAQ · News. Dropped the old "About → #transparency" mapping.
- Still placeholder copy; still to build (recommended): Contact, a full Donate
  page, and a client-facing **Request a Ride / Get Help** page.

### Back-to-Journal link repositioned
- Moved the **"← Back to the Journal"** link out of the narrow centered article
  column into its own bar at the **top-left**, flush with the site gutter
  (`max-w-[1200px] px-16`, matching the navbar edge). Previously it floated in
  from the left on wide screens.
- File: `src/pages/journal/[...slug].astro`.

### Fixed content-collection crash on posts missing an excerpt
- **Symptom:** creating a post in Keystatic without an excerpt broke the whole
  dev server (`InvalidContentEntryDataError … excerpt: Required`), because Astro
  rejects the entire collection when one entry fails validation.
- **Fix (two-sided):**
  - `src/content.config.ts` — `excerpt` now `z.string().default('')` so an
    in-progress draft can't take down the site.
  - `keystatic.config.tsx` — Excerpt field is now **required** in the editor
    (`validation: { length: { min: 1 } }`) so real posts still get one.
  - `[...slug].astro` + `rss.xml.js` — meta description / feed fall back to the
    title if an excerpt is ever empty.

### Initialized git
- `git init` + first commit (`Initial commit: Housing Support Rides site`),
  53 files tracked on branch `master`.
- `.gitignore` extended to ignore Astro's generated `.astro/` and `.env` secrets.
- Note: default branch is `master`; rename to `main` before pushing to GitHub if
  desired (`git branch -M main`).

### Rebrand: Riverbend Foundation → Housing Support Rides
- Swapped the org **name** everywhere user-facing + in config/docs: navbar &
  footer wordmarks, page titles, meta/OG, aria labels, email domain
  (`housingsupportrides.org`), 501(c)(3) line, RSS title, `astro.config` `site`,
  Keystatic brand, default post author.
- Two brand-tied taglines were **adapted** (not literal swaps) and can be
  changed: hero eyebrow → "Rides to housing, healthcare, and home since 1997";
  landing `<title>` → "Getting neighbors where they need to be".
- ⚠️ **Still pending:** the watershed *body copy* (mission "Monitor. Restore.
  Defend.", river impact stats, programs, address, "Report a pollution
  incident") is unchanged — name-only rebrand. Update in `src/lib/content.ts`,
  `Footer.tsx`, `Hero.tsx` when real copy is ready.

### Migrated Vite React SPA → Astro 7 (blog + CMS)
- **Option A** from [blog-cms-plan.md](./blog-cms-plan.md): whole site moved to
  Astro. Landing page reuses the React components as one `client:load` island.
- **Blog** at `/journal` from an MDX content collection
  (`src/content/journal/*.mdx`); article pages, **RSS** (`/rss.xml`), sitemap.
- **Keystatic** git-based CMS at `/keystatic` (local mode); `@astrojs/node`
  adapter (only its admin route needs a server).
- Removed the Vite entry (`index.html`, `main.tsx`) + `react-router-dom`; moved
  `index.css` → `src/styles/global.css`; scripts now `astro dev/build/preview`.
- Added the **[../how-to/](../how-to/)** guides (writing posts, the admin,
  deploying, editing the site).

## 2026-08 (earlier — the foundation)

- Built the **single-page nonprofit site**: navbar, hero, impact counters,
  programs, donate block, field stories, get-involved, transparency, partners,
  newsletter, footer — Tailwind v4 design system (ivory/teal), Framer Motion
  effects. (Then the color scheme was set to white/red, later replaced by the
  ivory/teal Riverbend design system that carried into the rebrand.)
- Before that: scaffolded a React + Vite + TypeScript skeleton with notes.
