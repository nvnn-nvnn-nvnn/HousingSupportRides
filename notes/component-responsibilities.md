# Component & Section Responsibilities

> These React components render the **landing page**, now mounted as a single
> Astro island (`src/pages/index.astro` → `<App client:load/>`). The blog is
> separate — static Astro pages under `src/pages/journal/`. Section `id`s are the
> nav anchor targets; cross-page nav links use `/#id` (see `NAV_LINKS`).

## Layout

| File | Responsibility |
| --- | --- |
| `layout/Navbar.tsx` | 76px sticky bar. Gains a border + blur after 8px scroll. Desktop center links; mobile shows mark + Donate pill + hamburger → full-screen ivory overlay (locks body scroll). |
| `layout/Footer.tsx` | Deep slate-teal, 4 columns (brand/programs/get-involved/contact), legal strip with EIN + © + an orange **Report a pollution incident** link. |

## Common

| File | Responsibility |
| --- | --- |
| `common/BrandMark.tsx` | Two-curve river-bend SVG mark; takes color via `currentColor`. |
| `common/Eyebrow.tsx` | Small uppercase, letter-spaced teal label above headings. |
| `common/FadeUp.tsx` | **Effect 4.** Wraps children so they rise 24px + fade in once on scroll. Props: `index` (stagger), `delay`, `as`. |
| `common/FormResult.astro` | **Astro, not React** — used by `/contact` and `/volunteer/apply`, not the landing island. Success panel (check mark, heading, body, optional "send another" button) that replaces a form after a successful send. Ships hidden; `initWeb3Form` in `lib/web3forms.ts` owns showing it, so the component has no logic of its own. Props: `id` (must match the lookup in the page's script), `title`, `body`, `resetLabel`. |
| `common/MediaPlaceholder.tsx` | Layered teal "water & light" gradient standing in for a real photo. Carries `alt` + `hint` (art direction). **Swap for `<img>` later.** |
| `ui/Button.tsx` | Renders `<a>` if `href` given, else `<button>`. Variants: `primary` (orange), `outline` (teal), `outline-light` (on teal), `ghost`. Sizes `sm/md/lg`. |

## Sections (top → bottom)

| Section | id | What it does | Notable behavior |
| --- | --- | --- | --- |
| `Hero` | `#top` | **Full-width** community photo (aspect-ratio locked to match the actual photo, so nobody is cropped out), headline + CTAs overlaid on its lower portion via a dark scrim gradient. | Photo fades/scales in on load; text staggers in over it. Sizing/spacing scale down on mobile, up at `md:`. |
| `ImpactCounters` | `#impact` | 4 headline numbers on the card tone. | **Effect 2** — each counts 0→value (2s ease-out) on view; a maroon rule scales in from the left beneath it. |
| `OurWork` | `#our-work` | `MISSION.purpose` as the intro, then a 2×2 grid of the four programs. | Cards stagger in; hover lifts −4px and deepens shadow. "Learn more" deep-links to `/what-we-do#<slug>`. |
| `DonateBlock` | `#donate` | Maroon band. Frequency toggle + 4 tiers + custom amount. | **Effect 1** — selecting a tier animates the impact sentence (`AnimatePresence`); the CTA label updates live, e.g. "Donate $60 Monthly". CTA is a real **Givebutter** `<givebutter-button>` once configured (see `src/lib/content.ts`); a disabled placeholder until then — no longer decorative-only. |
| `FieldStories` | `#field-stories` | 3 story cards; first spans 2 cols / 2 rows on desktop. | **Effect 3** — dark duotone wash lifts + image scales on hover; caption gradient with category + serif title. |
| `GetInvolved` | `#get-involved` | Pale-maroon band, 3 involvement routes with icons + outline CTAs. | Cards stagger in. |
| `Transparency` | `#transparency` | 2-col: animated 89/7/4 budget bar (⚠️ placeholder figures) + legend + paragraph; `CHARITABLE_PURPOSE` statement + document download list. | Bar segments animate width 0→% sequentially (stagger 0.15s). |
| `Partners` | — | Row of six text-only supporter badges. | Fades in. |
| `Newsletter` | — | Maroon band, inline email capture. | Submits to a local "thanks" state (no backend yet). |

## Standalone page components

| Component | Used by | Job | Worth knowing |
| --- | --- | --- | --- |
| `PageHeader.astro` | every non-landing page | Shared eyebrow + title + lead band. | Keeps the standalone pages visually consistent with the landing sections. |
| `GalleryGrid.astro` | `/gallery` (twice: Highlights, then Archive) | Renders a list of resolved photos as clickable tiles that feed the lightbox. | `dense` prop gives the Archive tighter tiles. `<Image>` sets `width`/`height` explicitly — with only `widths`, the plain `src` fallback renders at the **source** size (~4000px). A photo whose file is missing renders a visible "Missing: …" tile instead of failing the build. |

`/gallery` itself does the data work in frontmatter (glob resolution, date
sort, the second larger render for the lightbox) and owns the `<dialog>` +
zoom/pan script. See [CHANGELOG.md](./CHANGELOG.md) → "Gallery: Highlights/
Archive grid" for the decisions behind it.

## Where the data comes from

All of it is in **`src/lib/content.ts`**: `MISSION`, `CHARITABLE_PURPOSE`,
`NAV_LINKS`, `IMPACT_STATS`, `PROGRAMS`, `DONATION_TIERS`, `FIELD_STORIES`,
`INVOLVEMENT`, `BUDGET_SEGMENTS`, `DOCUMENTS`, `PARTNERS`, `GALLERY_IMAGES`.
Sections are thin — they map over these arrays, so most content edits happen in
that one file.

`MISSION` and `CHARITABLE_PURPOSE` are the mission copy, shared across the
landing sections *and* the standalone pages (`/what-we-do`, `/history`) and the
JSON-LD in `BaseLayout.astro`. They derive from
[mission-and-programs.md](./mission-and-programs.md) — the official program
description, verbatim.
