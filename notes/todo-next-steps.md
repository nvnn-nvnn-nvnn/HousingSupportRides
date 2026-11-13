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

3. **Contact form** ✅ — `/contact` submits via Web3Forms, and
   `WEB3FORMS_ACCESS_KEY` is now set (2026-09-22). Verified inlined into the
   built client bundle; **delivery itself is still unconfirmed** — that takes
   one real submission landing in the registered inbox. Both forms now show a
   proper success screen ([../how-to/form-feedback.md](../how-to/form-feedback.md)).
4. **Volunteer form** ✅ — one shared intake form at `/volunteer/apply`
   (checkbox group, not a form per role); the driver/coordinator pages link
   to it pre-filled. Same `WEB3FORMS_ACCESS_KEY` powers both.
   - [ ] ⚠️ **Spam protection before launch.** The access key is public in the
         client bundle by design, so the client-side honeypot in `web3forms.ts`
         does nothing against a bot POSTing straight to the Web3Forms API — and
         the free tier keeps **no archive**, so a lost email is a lost enquiry.
         Turnstile setup: [../how-to/form-spam-protection.md](../how-to/form-spam-protection.md).
5. **Site content refresh** — mission, program names, program details, and the
   FAQ are now **real copy** (2026-09-20), and the **address is corrected** to
   1351 3rd St E, Saint Paul, MN 55106 (2026-09-22). What's left: **impact
   stats**, the **budget split**, and team/leadership. See § 5 below — the
   first two are the urgent ones, because they're stated as fact.
   - [ ] ⚠️ **The NPI registry still lists the old address** (917 Edmund Ave).
         Update it at the source — grantors verify against that record.
6. **Blog refresh** ✅ first real post is live (2026-09-22) —
   `recovery-picnic-2026.mdx` published (`draft: false`); it builds to
   `/journal/recovery-picnic-2026` and is in `rss.xml`.
   ⚠️ **This item used to say "replace the 3 placeholder posts."** That was
   stale on both counts: there is only **one** post in the collection, and it
   isn't a placeholder — it's real, bylined copy about the September 5 picnic.
   `testing.mdx` is already gone. Remaining:
   - [ ] Write a second post, so `/journal` isn't a single-item list.
   - [ ] Consider restoring `<FieldStories />` in `App.tsx` — it was disabled
         *because* its only card was this post while it was an unpublished
         placeholder. That reason no longer holds.
7. **Gallery** ✅ mostly done (2026-09-20) — `/gallery` now splits into
   **Highlights** / **Archive** by date, with optimized tiles and a native
   `<dialog>` lightbox (zoom, drag-pan, pinch, wheel). See
   [CHANGELOG.md](./CHANGELOG.md) for the decisions. Remaining:
   - [x] **All 32 photos are live again (2026-09-22).** 29 entries had been
         commented out; photo releases were confirmed signed, so they were
         restored. ⚠️ Note the failure mode for next time: the Archive section
         renders only when `archive.length > 0`, and with `HIGHLIGHT_COUNT = 6`
         that means **it silently disappears whenever 6 or fewer photos are
         active** — no error, no empty state, just a missing section.
   - [ ] 🚨 **Placeholder `alt` text — now shipping.** Only the 3 entries marked
         `// ✓ reviewed` in `GALLERY_IMAGES` have real alt/title/blurb; the other
         **29 share the generic `PLACEHOLDER_ALT`/`PLACEHOLDER_BLURB`**. This is
         an **accessibility** gap, not unfinished copy — screen-reader users get
         nothing useful from 29 of 32 photos. Was mitigated by those entries
         being disabled; that mitigation is gone. Fix per photo and move each up
         to the "✓ reviewed" group as you go.
   - [x] Looping hero carousel — built 2026-11-09. Five photos in
         `HERO_IMAGES` (`content.ts`), files in `public/img/hero/`.
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
- [ ] 🚨 **Newsletter** (`sections/Newsletter.tsx`) — **shows a false
      confirmation.** `onSubmit` sets `submitted` and discards the address;
      the visitor reads "Thanks — check your inbox to confirm" and is not
      subscribed to anything. This is worse than an obviously broken form,
      because nobody reports it. **Either wire it to a real provider or remove
      the section before launch** — shipping it as-is collects goodwill for a
      list that doesn't exist. Setup:
      [../how-to/newsletter.md](../how-to/newsletter.md) (MailerLite
      recommended; RSS-to-email then mails new journal posts automatically,
      since `rss.xml.js` already exists).

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

## 8. Admin dashboard (built 2026-11-04 — needs production setup)

Email + password sign-in at `/admin` with Better Auth, a Turso/libSQL database,
and an admin plugin for roles. Guide: [../how-to/admin-dashboard.md](../how-to/admin-dashboard.md).
Background reasoning: [../how-to/admin-accounts.md](../how-to/admin-accounts.md).

> This section previously said the feature was deliberately unimplemented so it
> could be written by hand as a learning exercise. That changed on 2026-11-04 —
> it was requested as a build.

Done and tested locally (28 end-to-end checks plus a CSRF check):
- [x] Sign-in, sign-out, sessions stored server-side and revocable
- [x] Public sign-up disabled; first admin via `npm run admin:create`
- [x] `/admin` dashboard, `/admin/submissions` (filter + delete), `/admin/users`
      (add, remove, set password, sign out everywhere)
- [x] `/keystatic` gated behind the same login
- [x] Contact + volunteer forms save a copy after the email succeeds
- [x] Database-backed rate limits on sign-in and on the public submit endpoint
- [x] Verified no admin page builds as static HTML (the prerender trap)

Before it works on the live site:
- [ ] 🚨 **Create a Turso database and set 4 env vars in Vercel**
      (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `BETTER_AUTH_SECRET`,
      `BETTER_AUTH_URL`), run `npm run db:migrate` + `npm run admin:create`
      against production, redeploy. Steps in admin-dashboard.md. Until then
      `/admin` returns "not configured" — the public site is unaffected.
- [ ] Clear production values out of local `.env` afterwards, or `npm run dev`
      writes to the live database.
- [x] Local dev set up (2026-11-10): `local.db` migrated, admin
      `techkage@proton.me` created. Local only. Production still needs its own.
- [ ] Change the local `techkage@proton.me` password. The temporary one was
      shown in a chat session.

Decisions still open (policy, not code):
- [ ] ⚠️ **Retention.** Submissions are now stored at rest and nothing deletes
      them automatically. Decide a period.
- [ ] **Deletion requests** — data now lives in three places: dashboard,
      Web3Forms email, inbox.
- [ ] **Keystatic Cloud: create the project** at keystatic.cloud, connect the
      repo, paste `team/project` into `KEYSTATIC_CLOUD_PROJECT` in
      `keystatic.config.tsx`, invite staff. Code is ready (2026-11-08); until
      then production stays in GitHub mode. Steps: how-to/keystatic-cloud.md.
      ⚠️ Free plan is 3 users.
- [ ] Every admin sees every submission. Add a read-only role if that's too
      broad.

**Deliberately excluded:** concern reports from `/transparency` are emailed only,
never stored, so a complaint can't reach the staff member it's about. Don't
"fix" this without designing an access rule for them first.

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
