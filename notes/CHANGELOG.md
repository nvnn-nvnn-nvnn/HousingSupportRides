# Changelog

A running log of notable work. Most recent first. For *why* behind big
decisions, see [blog-cms-plan.md](./blog-cms-plan.md); for how-tos, see
[../how-to/](../how-to/).

## 2026-09-20

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
