# Editing the Site (not the blog)

For blog posts, see [writing-a-post.md](./writing-a-post.md). This covers the
rest of the site.

## Change landing-page words / numbers
Almost all landing copy lives in one file:
**[`src/lib/content.ts`](../src/lib/content.ts)** — nav labels, impact stats,
programs, donation tiers, field-story cards, involvement routes, budget
percentages, documents, partners. Edit the strings/numbers there.

## Change the mission statement
`MISSION` and `CHARITABLE_PURPOSE` in
**[`src/lib/content.ts`](../src/lib/content.ts)** hold the official language from
the program description. Edit them once and they update everywhere they appear:

| Where it shows up | Which field |
| --- | --- |
| Page `<meta description>` + social previews (every page) | `MISSION.short` |
| `/what-we-do` mission block, `/history` mission block, search structured data | `MISSION.statement` |
| Home page "How We Help" intro | `MISSION.purpose` |
| Home page "Where the Money Goes", `/what-we-do` charitable-purpose section | `CHARITABLE_PURPOSE` |
| The whole `/what-we-do` page, in document order | `PROGRAM_DESCRIPTION` |
| Home page program cards | `PROGRAMS` (verbatim sentences pulled from the above) |

`MISSION.short` is also the one to paste into an Instagram or Facebook bio, so
the site and the social profiles stay in sync.

**Before you write a new mission or program claim,** check it against
[`notes/mission-and-programs.md`](../notes/mission-and-programs.md) — the
official program description, kept verbatim. If the claim isn't in there, it
isn't sourced yet.

## Change brand colors or fonts
**[`src/styles/global.css`](../src/styles/global.css)** — the `:root` block
defines every color token (ivory / teal / orange) and the fonts. Change a value
there and it updates everywhere, because components reference the tokens (e.g.
`var(--primary)`), not hardcoded hexes.

## Add a landing-page section
1. Create a React component in `src/components/sections/YourSection.tsx`
   (copy an existing one; reuse `FadeUp`, `Eyebrow`, `Button`, `MediaPlaceholder`).
2. Import and place it in **[`src/App.tsx`](../src/App.tsx)** in the order you want.
3. Give it an `id` if it should be a nav target, then add it to `NAV_LINKS` in
   `content.ts` (use `/#your-id` so it works from the blog too).

## Add a whole new page (Astro)
Create `src/pages/your-page.astro` and wrap content in the site chrome:
```astro
---
import SiteLayout from '../layouts/SiteLayout.astro'
---
<SiteLayout title="Your Page — Housing Support Rides" description="…">
  <section class="mx-auto max-w-[1200px] px-5 py-24 md:px-16">
    <h1 class="font-serif text-4xl font-semibold">Your Page</h1>
  </section>
</SiteLayout>
```
It's live at `/your-page`. Add a nav link in `content.ts` if you want it in the menu.

## Add real photos (replaces the gradient placeholders)
Every image slot uses `<MediaPlaceholder>`, which shows a real photo when given a
`src` and the maroon gradient when not. **Just drop a file in `public/img/` and
set its path** — no component edits needed.

1. Put the file in `public/img/` (e.g. `public/img/hero.jpg`). Reference it as
   `/img/hero.jpg` (leading slash, no `public`).
2. Set the path in the right place:
   - **Hero** → `HERO_IMAGE` in [../src/lib/content.ts](../src/lib/content.ts)
   - **Home story cards** → the `image` field on each `FIELD_STORIES` entry (same file)
   - **Blog post cover** → the post's `cover` frontmatter (or the "Cover image
     path" field in `/keystatic`)

Tips: web-optimized JPG/WebP; roughly 1600px wide for the hero, ~800px for cards.
`object-cover` crops to fit, so exact dimensions don't need to match.

## Reference
Deeper "why it's built this way" docs live in [../notes/](../notes/):
folder structure, component responsibilities, and the blog/CMS decision record.
