# Editing the Site (not the blog)

For blog posts, see [writing-a-post.md](./writing-a-post.md). This covers the
rest of the site.

## Change landing-page words / numbers
Almost all landing copy lives in one file:
**[`src/lib/content.ts`](../src/lib/content.ts)** — nav labels, impact stats,
programs, donation tiers, field-story cards, involvement routes, budget
percentages, documents, partners. Edit the strings/numbers there.

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

## Swap image placeholders for real photos
Every image is a `<MediaPlaceholder />` (a teal gradient). Replace with a real
`<img>`:
```tsx
<img src="/img/hero.jpg" alt="River bend at sunrise" className="h-full w-full object-cover" />
```
Put the file in `public/img/` and reference it as `/img/hero.jpg`.

## Reference
Deeper "why it's built this way" docs live in [../notes/](../notes/):
folder structure, component responsibilities, and the blog/CMS decision record.
