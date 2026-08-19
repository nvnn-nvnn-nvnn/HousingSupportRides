# What Still Needs Wiring

The design, layout, copy, and all animations are done. What remains is
connecting the interactive bits to real services and swapping placeholder art.

## 1. Images (highest visual impact)
Every photo is currently a `MediaPlaceholder` (teal gradient). Each carries an
`alt` and a `hint` describing the intended shot. Replace with real `<img>`:
```tsx
// before
<MediaPlaceholder alt="River bend at sunrise" hint="…" className="h-full" />
// after
<img src="/img/hero.jpg" alt="River bend at sunrise" className="h-full w-full object-cover" />
```
- [ ] Hero background (`sections/Hero.tsx`)
- [ ] 3 field-story images (`sections/FieldStories.tsx`)
- [ ] Add a real favicon + logo (currently the SVG `BrandMark`).

## 2. Donation flow (`sections/DonateBlock.tsx`)
- [ ] The CTA button is inert. Wire `amount` + `frequency` to a real processor
      (Stripe Checkout, Donorbox, Givebutter…).
- [ ] Optional: "sticky-to-bottom CTA on mobile" from the spec was left as a
      normal full-width button to avoid fragile UX — revisit if wanted.

## 3. Forms
- [ ] **Newsletter** (`sections/Newsletter.tsx`) — currently sets a local
      "thanks" state. Connect to Mailchimp/Buttondown/etc.
- [ ] **Report a pollution incident** (footer link `href="#"`) — point at a real
      form or mailto.

## 4. Links & documents
- [ ] Transparency document links (`href="#"`) → real Annual Report / 990 / etc.
- [ ] "Learn more →" (programs) and "Read the story →" (field stories) →
      real detail pages or external URLs. If you add detail pages, consider
      reintroducing a router.
- [ ] Privacy Policy link in the footer.

## 5. Content
- [ ] Body copy is still the watershed draft (mission, river stats, address) —
      rebranded to Housing Support Rides in name only; confirm real numbers/stories
      before launch. Everything lives in `src/lib/content.ts`.

## 6. Blog / journalism section ✅ DONE
- [x] Migrated the site to **Astro** + built the blog at `/journal` from an MDX
      content collection (Option A). Decision record: [blog-cms-plan.md](./blog-cms-plan.md).
- [x] **Keystatic** git-based CMS wired at `/keystatic` (local mode).
- [x] "News" nav → `/journal`; Field Stories link to real articles; RSS + sitemap.
- [ ] Remaining: real cover images per post; decide production editing mode
      (local commit vs Keystatic GitHub mode) — see [../how-to/deploying.md](../how-to/deploying.md).

## 7. Polish & launch
- [x] Per-page `<title>`/meta + OG tags — handled by `BaseLayout.astro` now.
- [ ] Add a real social share image (`ogImage` prop on the layouts).
- [ ] Check keyboard nav + color contrast on the teal bands once real content is in.
- [ ] `npm run build` should stay green — run before committing.
- [ ] Deploy: **not a pure static SPA anymore.** Public pages are static, but the
      Keystatic admin needs a server, so swap `@astrojs/node` for your host's
      adapter (Netlify/Vercel/Cloudflare) and set `site`. See
      [../how-to/deploying.md](../how-to/deploying.md).
- [ ] Optional: `npm audit fix` — a few transitive advisories exist in the toolchain.

---

### Cheatsheet
- **Write a blog post:** `src/content/journal/*.mdx` or `/keystatic` — see [../how-to/writing-a-post.md](../how-to/writing-a-post.md).
- **Edit landing words/numbers:** `src/lib/content.ts`.
- **Add a section:** new file in `src/components/sections/` → import + place in
  `src/App.tsx` → give it an `id` and (optionally) add to `NAV_LINKS`.
- **Change a brand color/font:** `src/styles/global.css` (`:root` vars + `@theme`).
- **Reuse the fade-up animation:** wrap anything in `<FadeUp>`.
