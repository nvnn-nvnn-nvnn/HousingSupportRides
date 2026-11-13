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

For photos, see [Adding images](#adding-images) below. For drafts and how
saving works, see [using-the-admin.md](./using-the-admin.md).

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
| `cover` | – | Optional. Uploaded in Keystatic, which stores the URL here (e.g. `/img/journal/my-post/cover.jpg`). Falls back to a placeholder. See [Adding images](#adding-images). |
| `coverAlt` | – | Alt text for the cover. |
| `draft` | – | `true` hides it from the built site and the list. |
| `tags` | – | Array of strings; added to the RSS categories. |

> The field names are defined once in [`src/content.config.ts`](../src/content.config.ts)
> (validation) and [`keystatic.config.tsx`](../keystatic.config.tsx) (the editor).
> If you add a field, add it in **both** places.

---

## Adding images

*Upload buttons added 2026-11-10. Before that, the cover was a text box where
you typed a path to a file someone had copied into `public/` by hand.*

### For editors: how to add a photo

**Cover image** (top of the post, and the card on `/journal`):
1. **Resize the photo first:** about **1600px wide**, under **500 KB**. See
   "Resizing a photo" below.
2. In the post, find **Cover image** in the right-hand column and click
   **Choose file**. A preview appears.
3. Fill in **Cover alt text**: one sentence describing the photo for someone
   who can't see it, e.g. *"Volunteers serving food at an outdoor picnic."*
4. Click **Save**.

To swap a cover, click **Choose file** again. **Remove** clears it, and the
post falls back to the maroon placeholder.

**Photos inside the article:**
1. Resize first (same as above).
2. Click where the photo should go, then click the **image button**, the last
   icon in the editor toolbar.
3. Pick the file, then fill in its **alt** text when asked.
4. **Save.**

Landscape photos work best for covers. The `/journal` card crops to a wide
shape, so people at the very top or bottom of a tall photo can be cut off.

### Resizing a photo

Phone photos are often 3–5 MB. Uploaded as-is, one photo can weigh more than
the rest of the page put together, and the page loads slowly on a phone.

- **Windows:** open the photo in **Photos** → **⋯** → **Resize image** →
  pick a size about **1600px wide** → save a copy.
- **Mac:** open in **Preview** → **Tools → Adjust Size** → width **1600** →
  save.
- **Phone:** most "share" menus can reduce size. Choose "Large" or "Medium",
  not "Actual size".
- **Developers:** see [images.md](./images.md), or the sharp one-liner in
  [hero-carousel.md](./hero-carousel.md#step-2-make-the-two-file-sizes)
  (one width only, 1600).

### Where the files go

Everything uploaded for the journal lives in **`public/img/journal/`**:

| What you uploaded | Saved as | Stored in the post as |
| --- | --- | --- |
| Cover for post `my-post` | `public/img/journal/my-post/cover.jpg` | `cover: /img/journal/my-post/cover.jpg` |
| Photo in the body | `public/img/journal/<original-filename>.jpg` | `![alt](/img/journal/<original-filename>.jpg)` |

- **Covers are named after the field, not the photo.** Every cover is called
  `cover.<ext>`, inside a folder named after the post's slug. Uploading a new
  cover **replaces** the old file in place.
- **Body photos keep their original filename.** Two different photos both
  called `IMG_0001.jpg` would collide, so rename photos to something
  descriptive before uploading (`picnic-volleyball.jpg`).
- ⚠️ **Changing a post's slug** after adding a cover hasn't been tested. After
  a slug change, check the cover still shows. If it doesn't, re-upload it.

### Saving: local vs. the live site

| Where you're editing | What "Save" does with the image | What you do |
| --- | --- | --- |
| Your computer (`npm run dev`, `/keystatic`) | Writes the file into `public/img/journal/` on disk | **Commit the image along with the `.mdx`**, or the live site shows a broken image |
| The live site (Keystatic Cloud / GitHub mode) | Commits the image and the post to GitHub together | Nothing. The site redeploys with both |

### How it works (for developers)

All of this lives in [`keystatic.config.tsx`](../keystatic.config.tsx):

```tsx
const JOURNAL_IMAGE_DIR = 'public/img/journal'   // where files are written
const JOURNAL_IMAGE_URL = '/img/journal/'        // the URL that folder is served at

cover: fields.image({
  label: 'Cover image',
  directory: JOURNAL_IMAGE_DIR,
  publicPath: JOURNAL_IMAGE_URL,
}),

body: fields.mdx({
  label: 'Body',
  options: { image: { directory: JOURNAL_IMAGE_DIR, publicPath: JOURNAL_IMAGE_URL } },
}),
```

- **`directory`** is where Keystatic writes the uploaded file. **`publicPath`**
  is what it writes into the post. They must describe the same place: anything
  in `public/` is served from `/`, so `public/img/journal` → `/img/journal/`.
  Change one without the other and every image breaks.
- **Why the post pages didn't change:** `fields.image` saves a plain string
  URL in the frontmatter, the same kind of value the old text field held. So
  `src/content.config.ts` (`cover: z.string().optional()`) and the post pages,
  which pass it straight to an `<img>`, kept working untouched.
- **Why `public/` and not `src/assets/`:** files in `src/assets/` get resized
  and converted to WebP by Astro during the build, the way the gallery works.
  That would be better for page speed, but it requires the content schema to
  use Astro's `image()` helper and the post pages to use `<Image>`. That's a
  bigger change, so it wasn't done yet. `public/` files are served exactly as
  uploaded, which is why editors are asked to resize first.
  If oversized uploads keep happening, that's the upgrade to make.
- **Without `directory` on the body field,** Keystatic would save body images
  next to the `.mdx` file in `src/content/journal/`, mixing photos in with
  posts.
- **The existing picnic post** was moved to the new layout: its cover is now
  `public/img/journal/recovery-picnic-2026/cover.jpg`, a 670 KB optimized copy
  of the original 2 MB `public/img/cover.jpg`. Keystatic works out which file
  a cover is by removing `publicPath` from the front of the stored URL, so a
  path outside it (`/img/cover.jpg`) can't be matched to a file. (This wasn't
  tested; the post was moved to be safe.)
  The original `cover.jpg` stays where it is, because the gallery and
  `FIELD_STORIES` use it.

**Tested 2026-11-10 in local mode:** the editor shows the existing cover with
a preview, the toolbar has the image button, uploading a new cover replaced
`cover.jpg` in the post's folder and kept the path in the frontmatter, and
`npm run build` serves the image on both `/journal` and the post page.
**Not yet tested:** uploading a photo into the body, and uploads on the live
site (needs Keystatic Cloud or GitHub mode set up).

---

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
- [ ] images resized before upload (about 1600px wide, under 500 KB)
- [ ] commit the `.mdx` **and** its images in `public/img/journal/` to git
      (local editing only; on the live site Keystatic commits them for you)

## ⚠️ No comments in a post body

Do not put `{/* comment */}` blocks — or any `{ }` expression — in a post's
body. The site builds fine with them, but **Keystatic cannot open the post**:

```
Error: Field validation failed: body: Unhandled type mdxFlowExpression
```

Keystatic edits the body as a document, not as code, and has no way to
represent an expression. HTML comments (`<!-- -->`) are no alternative either —
MDX rejects them outright.

Put notes for editors somewhere else: in the `excerpt` while the post is a
draft, or in this folder's docs. Set `draft: true` to keep an unfinished post
off the site.
