# Changelog

A running log of notable work. Most recent first. For *why* behind big
decisions, see [blog-cms-plan.md](./blog-cms-plan.md); for how-tos, see
[../how-to/](../how-to/).

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
