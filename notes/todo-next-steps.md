# What Still Needs Wiring

> **Tickable version:** https://claude.ai/artifact/D5JmZsPJVksw5Wwix3zh2p
> — the same list as a checklist that saves what is ticked, including the
> non-code launch work (DNS, accounts, insurance, photo releases) that does not
> belong in this file. This file stays the engineering record; if the two drift,
> this one wins for anything about the codebase.

## 🚀 Launch punch list (current priority)

Domain purchased (Squarespace registrar) and a Givebutter account started, but
**not yet ready to go live.** Remaining before launch, in the order the user
gave:

1. **Domain** — point the Squarespace-registered domain at Vercel (DNS), and
   set `site` in `astro.config.mjs` to the real domain.
2. **Givebutter** ⚠️ — setup is proving painful (2026-09-19). Still needs
   `GIVEBUTTER_ACCOUNT_ID` + `GIVEBUTTER_CAMPAIGN_CODE` in `src/lib/content.ts`.
   See [../how-to/deploying.md](../how-to/deploying.md) → "Connecting Givebutter."
   **Not load-bearing** — both values are empty-gated, so the site builds and
   deploys fine without them. If Givebutter stays a headache, swapping to
   **Donorbox**, **Zeffy** (no platform fee for nonprofits), or a plain
   **Stripe payment link** is a contained change, mostly in `DonateBlock.tsx`.

3. **Contact form** ✅ — `/contact` now submits via Web3Forms. Just needs a
   real `WEB3FORMS_ACCESS_KEY` in `src/lib/content.ts` to go live.
4. **Volunteer form** ✅ — one shared intake form at `/volunteer/apply`
   (checkbox group, not a form per role); the driver/coordinator pages link
   to it pre-filled. Same `WEB3FORMS_ACCESS_KEY` powers both.
5. **Site content refresh** — mission, program names, program details, and the
   FAQ are now **real copy** (2026-09-20). What's left: **impact stats**, the
   **budget split**, team/leadership, and address details. See § 5 below — the
   first two are the urgent ones, because they're stated as fact.
6. **Blog refresh** — replace the 3 placeholder journal posts with real posts
   (and delete `testing.mdx`).
7. **Gallery** ✅ mostly done (2026-09-20) — `/gallery` now splits into
   **Highlights** / **Archive** by date, with optimized tiles and a native
   `<dialog>` lightbox (zoom, drag-pan, pinch, wheel). See
   [CHANGELOG.md](./CHANGELOG.md) for the decisions. Remaining:
   - [ ] ⚠️ **Placeholder `alt` text** — only the 3 entries marked `// ✓ reviewed`
         in `GALLERY_IMAGES` have real alt/title/blurb. The rest share a generic
         `PLACEHOLDER_ALT`, which is an **accessibility** gap, not just unfinished
         copy. Screen-reader users get nothing useful from those 20-odd photos.
   - [ ] Looping hero carousel (still unbuilt).
   - [ ] Scroll-reveal on the tiles (still unbuilt — the `.reveal` hook described
         in the how-to is not wired up).
   Guides: [../how-to/images.md](../how-to/images.md),
   [../how-to/hero-carousel.md](../how-to/hero-carousel.md),
   [../how-to/gallery-page.md](../how-to/gallery-page.md).

Everything below is the fuller reference list this rolls up from.

## 1. Images

**Decision (2026-09-19):** use Astro's **built-in** optimization
(`astro:assets` + sharp) with images committed to `src/`. No external service.
Full reasoning + how-to: [../how-to/images.md](../how-to/images.md).

- [x] Hero photo wired (`HERO_IMAGE` in `content.ts` → `/img/cover.jpg`).
- [ ] ⚠️ **Optimize `cover.jpg`** — it's 2 MB / 4080×3072 sitting in `public/`,
      which Astro does **not** optimize, and it's the hero (= our LCP image).
      Move photos to `src/assets/img/` and render via `<Image />`. Usually
      drops it to ~100–200 KB.
- [ ] 3 field-story images (`FIELD_STORIES[].image` in `content.ts`) — still
      the maroon gradient placeholder. See [../how-to/editing-the-site.md](../how-to/editing-the-site.md).
- [ ] Blog post cover images (`cover` frontmatter / Keystatic field) — placeholder.
- [x] Real logo in Navbar/Footer (from `assets/HousingSupportRidesLogoSVG.svg`).

### Revisit later: Cloudinary (or another image CDN)
Not needed now — built-in optimization covers committed photos. **Reconsider
if any of these become true:**
- Non-technical staff need to upload photos **without a deploy** (biggest one)
- You add **video**
- You want on-the-fly transforms (smart/face-aware cropping, background removal)
- The photo library grows large enough that build times get annoying

Options at that point: `astro-cloudinary` (https://astro.cloudinary.dev), or
Vercel's own image service (`imageService: true` in the adapter — already
supported by our `@astrojs/vercel` v11). Comparison table lives in
[../how-to/images.md](../how-to/images.md).

## 2. Donation flow ✅ mostly done
- [x] Givebutter wired into `DonateBlock.tsx` (real `<givebutter-button>`,
      disabled placeholder until configured). See punch list #2 above.
- [ ] Not confirmed: whether the selected $ amount can be passed into
      Givebutter's checkout popup (no documented preset param found yet).

## 3. Forms
- [x] **Contact** (`pages/contact.astro`) — see punch list #3.
- [x] **Volunteer intake** (`pages/volunteer/apply.astro`) — see punch list #4.
- [ ] **Newsletter** (`sections/Newsletter.tsx`) — sets a local "thanks" state
      only; connect to Mailchimp/Buttondown/etc. (Could also just move to
      Web3Forms like the other two, for consistency.)

## 4. Links & documents
- [x] "Learn more" (programs) → `/what-we-do#<slug>`; "Read the story" (field
      stories) → real `/journal/<slug>` posts.
- [ ] Transparency document links (`href="#"`) → real Annual Report / 990 / etc.
- [ ] Privacy Policy link in the footer (`href="#"`).

## 5. Content — mission is real, numbers are not

> **Decision (2026-09-20): hide, don't fill — but not yet.** For most of the
> placeholder content below, the plan is to *remove it from the page* before
> launch rather than invent numbers to fill it. An absent stats band reads as a
> young organization; a fabricated one is a specific claim someone can check.
>
> **Timing is deliberate:** this is a pre-launch pass, not something to do while
> the site is still being built out. Placeholders are useful right now — they
> keep layouts honest about their own spacing. Pulling them early means
> designing against empty sections for weeks.
>
> **When that pass happens,** the mechanism should mostly already be there: the
> home page sections are driven by arrays in `src/lib/content.ts`, so emptying
> an array is the natural lever. ⚠️ **Verify this per section rather than
> assuming it.** Some components may render an empty shell — a heading and
> padding with nothing under it — which looks more broken than a placeholder
> does. Each one needs either a confirmed empty state or an explicit removal
> from the page that calls it.

- [x] Renamed/rebranded from the watershed draft to Housing Support Rides copy.
- [x] **Mission + programs are the real thing** (2026-09-20) — `MISSION`,
      `CHARITABLE_PURPOSE`, and `PROGRAMS` in `src/lib/content.ts` come from the
      organization's official program description, kept verbatim at
      [mission-and-programs.md](./mission-and-programs.md). Edit them there and
      every page follows; the field→location table is in
      [../how-to/editing-the-site.md](../how-to/editing-the-site.md).
- [x] FAQ — 6 placeholders replaced with 10 real answers.

### ⚠️ Stated as fact on the live site, but still placeholder
These are the ones to fix before launch — they're not vague copy, they're
specific claims a donor or reporter could check, and **none of them appear in
[mission-and-programs.md](./mission-and-programs.md)**:

- [ ] **`IMPACT_STATS`** — all four numbers (1,850 housed / 24,000 rides /
      76 partners / 610 volunteers) are invented. `/what-we-do` at least labels
      them "placeholder figures"; the home-page counters do not.
- [ ] **`BUDGET_SEGMENTS`** — the 89% / 7% / 4% split, repeated in prose in
      `Transparency.tsx` ("Eighty-nine cents of every dollar…").
- [ ] **Two FAQ answers** marked `// CONFIRM` in `faq.astro`: that rides are
      free, and the service area ("Saint Paul and surrounding communities").
      Neither is in the program description.
- [ ] **501(c)(3) / EIN status** — confirm before the tax-deductibility claim
      in the FAQ and in `DonateBlock.tsx` (see its TODO comment).
- [x] Removed the hero's "Charity Navigator 4-Star" line — an unverified claim
      about a real third party, which is a different order of risk from vague
      placeholder prose.

### Still placeholder, lower risk
- [ ] Team / leadership — `/history` has a placeholder timeline (2024 and
      "Today" are both empty) and lists only the Executive Director.
- [ ] Address details in the footer.

## 6. Blog / journalism section — infrastructure done, content is not
- [x] Astro + MDX content collection at `/journal`; Keystatic CMS at
      `/keystatic` (local mode in dev, **GitHub mode in production** — see
      [../how-to/deploying.md](../how-to/deploying.md) → "Multiple editors").
- [x] "News" nav → `/journal`; RSS + sitemap.
- [x] The 3 invented client stories and `testing.mdx` are deleted (2026-09-21).
- [ ] `recovery-picnic-2026.mdx` is the only post and its body is still prompts,
      not copy. Its `excerpt` and the `blurb` in `FIELD_STORIES` are separate
      strings — write both together or the home page and the post disagree.
- [ ] `testing.mdx` is still present in `src/content/journal/` — delete or
      finish it.

## 7. Polish & launch
- [x] Per-page `<title>`/meta + OG tags (`BaseLayout.astro`).
- [x] Deploy adapter fixed to `@astrojs/vercel` (was briefly `@astrojs/node`,
      which silently doesn't work on Vercel — see the ⚠️ in
      [README.md](./README.md) and [CHANGELOG.md](./CHANGELOG.md)).
- [x] Domain — see punch list #1.
- [x] Social share image wired — `public/img/social-card.jpg` (1200×630) is the
      default `ogImage` in `BaseLayout.astro`, so every page has a preview.
- [ ] ⚠️ **Decide whether the site palette follows the logo.** The new logo is
      navy and gold; the whole site is maroon. See [CHANGELOG.md](./CHANGELOG.md)
      → "Logo assets, the social card…". Also fix the stale "(from logo)" comment
      on `global.css` line 11.
- [ ] No vector version of the new logo exists — would need redrawing. Not
      blocking: the site displays it at 48–96px and the 320px PNG covers that.
- [ ] Check keyboard nav + color contrast now that the theme is maroon (was
      teal at initial a11y pass).
- [ ] `npm run build` should stay green — run before committing.
- [ ] Optional: `npm audit fix` — a few transitive advisories exist in the toolchain.

## 8. Admin accounts (researched 2026-09-20, nothing built)

Study guide written at [../how-to/admin-accounts.md](../how-to/admin-accounts.md).
No code exists — this is deliberately unimplemented; the user is writing it.

The ask was "admins log in inside the site, without each needing a GitHub
account, like Eleventy." Findings:

- [ ] **The Eleventy pattern is the deprecated one.** Decap CMS + Netlify
      **Git Gateway** was the token broker that made in-site login work.
      Netlify has deprecated Git Gateway — existing sites keep working, new
      setups are discouraged. Don't start there in 2026.
- [ ] **Keystatic Cloud is the live equivalent** and is probably the whole
      answer: editors sign in without GitHub accounts, one `storage:` change in
      `keystatic.config.tsx`, free up to 3 users then $10/mo + $5/user. Try
      this *before* building anything.
- [ ] **A submissions dashboard is a separate, heavier project** — it means
      storing volunteer/contact PII at rest, which we currently do **not** do
      (Web3Forms emails it and keeps nothing). Answer the retention/deletion/
      access questions in Part 7 of the guide before creating a table.
- [ ] **Correction on record:** Better Auth was described here as a "managed
      provider." It isn't — it's a self-hosted library; *we* would hold the
      password hashes. Clerk/WorkOS are the managed ones.

⚠️ **The Astro-specific trap**, if any protected page ever gets built: this
project has no `output` set, so pages prerender by default and middleware never
runs for them. A protected page without `export const prerender = false` ships
as public static HTML with **no error and no warning**. Verify by checking
whether the page appears in `dist/` after a build, not by clicking around.

## Housekeeping (low priority, found during a notes audit)
- [ ] `src/components/layout/Header.tsx` is a 0-byte, unused file (not
      imported anywhere) — safe to delete whenever.

---

### Cheatsheet
- **Write a blog post:** `src/content/journal/*.mdx` or `/keystatic` — see [../how-to/writing-a-post.md](../how-to/writing-a-post.md).
- **Edit landing words/numbers:** `src/lib/content.ts`.
- **Add a section:** new file in `src/components/sections/` → import + place in
  `src/App.tsx` → give it an `id` and (optionally) add to `NAV_LINKS`.
- **Add a standalone page:** new `.astro` file in `src/pages/`, wrapped in
  `SiteLayout` (+ `PageHeader` for the title band) — see [../how-to/editing-the-site.md](../how-to/editing-the-site.md).
- **Change a brand color/font:** `src/styles/global.css` (`:root` vars + `@theme inline`;
  base element resets must stay inside `@layer base` or utility classes silently lose to them).
- **Reuse the fade-up animation:** wrap anything in `<FadeUp>`.
