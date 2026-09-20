# What Still Needs Wiring

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
- [ ] The 3 posts are placeholder stories — see punch list #6.
- [ ] `testing.mdx` is still present in `src/content/journal/` — delete or
      finish it.

## 7. Polish & launch
- [x] Per-page `<title>`/meta + OG tags (`BaseLayout.astro`).
- [x] Deploy adapter fixed to `@astrojs/vercel` (was briefly `@astrojs/node`,
      which silently doesn't work on Vercel — see the ⚠️ in
      [README.md](./README.md) and [CHANGELOG.md](./CHANGELOG.md)).
- [x] Domain — see punch list #1.
- [ ] Add a real social share image (`ogImage` prop on the layouts).
- [ ] Check keyboard nav + color contrast now that the theme is maroon (was
      teal at initial a11y pass).
- [ ] `npm run build` should stay green — run before committing.
- [ ] Optional: `npm audit fix` — a few transitive advisories exist in the toolchain.

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
