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
| `common/MediaPlaceholder.tsx` | Layered teal "water & light" gradient standing in for a real photo. Carries `alt` + `hint` (art direction). **Swap for `<img>` later.** |
| `ui/Button.tsx` | Renders `<a>` if `href` given, else `<button>`. Variants: `primary` (orange), `outline` (teal), `outline-light` (on teal), `ghost`. Sizes `sm/md/lg`. |

## Sections (top → bottom)

| Section | id | What it does | Notable behavior |
| --- | --- | --- | --- |
| `Hero` | `#top` | Split layout: headline + CTAs left, image right. | Text staggers in on load; image reveals via `clipPath` inset 100%→0% (1.2s). Mobile: image becomes a scrimmed background. |
| `ImpactCounters` | `#impact` | 4 headline numbers on the card tone. | **Effect 2** — each counts 0→value (2s ease-out) on view; a teal rule scales in from the left beneath it. |
| `OurWork` | `#our-work` | 2×2 grid of the four programs. | Cards stagger in; hover lifts −4px and deepens shadow. |
| `DonateBlock` | `#donate` | Teal band. Frequency toggle + 4 tiers + custom amount. | **Effect 1** — selecting a tier animates the impact sentence (`AnimatePresence`); the CTA label updates live, e.g. "Donate $60 Monthly". |
| `FieldStories` | `#field-stories` | 3 story cards; first spans 2 cols / 2 rows on desktop. | **Effect 3** — teal duotone wash lifts + image scales on hover; caption gradient with category + serif title. |
| `GetInvolved` | `#get-involved` | Pale-teal band, 3 involvement routes with icons + outline CTAs. | Cards stagger in. |
| `Transparency` | `#transparency` | 2-col: animated 89/7/4 budget bar + legend + paragraph; document download list. | Bar segments animate width 0→% sequentially (stagger 0.15s). |
| `Partners` | — | Row of six text-only supporter badges. | Fades in. |
| `Newsletter` | — | Teal band, inline email capture. | Submits to a local "thanks" state (no backend yet). |

## Where the data comes from

All of it is in **`src/lib/content.ts`**: `NAV_LINKS`, `IMPACT_STATS`,
`PROGRAMS`, `DONATION_TIERS`, `FIELD_STORIES`, `INVOLVEMENT`,
`BUDGET_SEGMENTS`, `DOCUMENTS`, `PARTNERS`. Sections are thin — they map over
these arrays, so most content edits happen in that one file.
