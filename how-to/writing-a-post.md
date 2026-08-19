# Writing a Journal Post

A post is a single **MDX file** in `src/content/journal/`. The filename becomes
the URL: `bringing-the-muddy-fork-back.mdx` → `/journal/bringing-the-muddy-fork-back`.

You can create it two ways. **Both write the same file** — use whichever fits.

---

## Option A — the admin UI (recommended, no code)

1. `npm run dev`, then open **http://localhost:4321/keystatic**.
2. Click **Journal → + Create**.
3. Fill in the fields (Title, Published, Author, Category, Excerpt, Cover, Tags),
   write the article in the **Body** editor, and toggle **Draft** off when ready.
4. Click **Create** / **Save**. Keystatic writes the `.mdx` file into
   `src/content/journal/` for you.
5. The dev site updates live. Commit the new file to git to keep it.

See [using-the-admin.md](./using-the-admin.md) for details on drafts, images,
and how saving works.

---

## Option B — by hand (fast, for developers)

1. Create `src/content/journal/my-post-slug.mdx`.
2. Add frontmatter + body (copy an existing post as a template):

```mdx
---
title: Your headline here
publishedAt: 2026-08-15
author: Your Name
category: Field Story        # Field Story | Advocacy | Cleanup | Water Quality | Education
excerpt: >-
  One or two sentences shown in the list and used as the search/meta description.
coverAlt: Describe the cover image for accessibility
draft: false                 # true = hidden from the site
tags:
  - restoration
---

Your opening paragraph.

## A subheading

Body text. **Bold**, *italic*, [links](https://example.org), lists, and
> block quotes

all work. Because these are MDX files, you can also import and use components
later if you want.
```

3. Save. With `npm run dev` running, the post appears at `/journal/my-post-slug`.

---

## The fields (must match everywhere)

| Field | Required | Notes |
| --- | --- | --- |
| `title` | ✅ | Article headline. |
| `publishedAt` | ✅ | `YYYY-MM-DD`. Controls sort order (newest first). |
| `author` | – | Defaults to "Housing Support Rides". |
| `category` | – | One of the values above; shown as the eyebrow label. |
| `excerpt` | ✅ | List preview + meta description. Keep it to ~1–2 sentences. |
| `cover` | – | Optional image path in `/public` (e.g. `/img/foo.jpg`). Falls back to a placeholder. |
| `coverAlt` | – | Alt text for the cover. |
| `draft` | – | `true` hides it from the built site and the list. |
| `tags` | – | Array of strings; added to the RSS categories. |

> The field names are defined once in [`src/content.config.ts`](../src/content.config.ts)
> (validation) and [`keystatic.config.tsx`](../keystatic.config.tsx) (the editor).
> If you add a field, add it in **both** places.

## Where it shows up automatically
- **/journal** — card in the list (newest first; drafts hidden)
- **/journal/\<slug\>** — the article page
- **/rss.xml** — the feed
- **sitemap** — for search engines

## Publish checklist
- [ ] `draft: false`
- [ ] `excerpt` reads well (it's the Google/preview text)
- [ ] `coverAlt` written if you added a `cover`
- [ ] `npm run build` passes
- [ ] commit the `.mdx` (and any image in `/public`) to git
