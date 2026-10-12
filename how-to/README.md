# How-To Guides

Practical, task-focused guides for running the Housing Support Rides site.
(For *why* the site is built the way it is, see [../notes/](../notes/).)

## I want to…

The fast lookup. Find your question, follow the link.

| I want to… | Go to |
| --- | --- |
| Publish a blog post | [writing-a-post.md](./writing-a-post.md) |
| Change wording on the landing page | [editing-the-site.md](./editing-the-site.md) |
| Add photos to the site | [images.md](./images.md) |
| Add photos to the gallery | [gallery-page.md](./gallery-page.md) |
| Let the hero photo cycle through several images | [hero-carousel.md](./hero-carousel.md) |
| Collect email addresses / send a newsletter | [newsletter.md](./newsletter.md) |
| Change what a form says after you hit send | [form-feedback.md](./form-feedback.md) |
| Stop spam coming through the forms | [form-spam-protection.md](./form-spam-protection.md) |
| Put the site online | [deploying.md](./deploying.md) |
| Turn on donations | [givebutter.md](./givebutter.md) |
| Let someone else edit the site | [using-the-admin.md](./using-the-admin.md) · [admin-accounts.md](./admin-accounts.md) |
| Find out what's left before launch | [../notes/todo-next-steps.md](../notes/todo-next-steps.md) |
| See what changed recently and why | [../notes/CHANGELOG.md](../notes/CHANGELOG.md) |

## ⚠️ Built vs. planned

**Some guides describe things that don't exist yet.** They're written as
instructions for building the feature, not documentation of a feature you can
use. Check here before following one and wondering why you can't find the code.

| Guide | Status |
| --- | --- |
| [writing-a-post.md](./writing-a-post.md) | ✅ Built and working |
| [using-the-admin.md](./using-the-admin.md) | ✅ Built and working |
| [editing-the-site.md](./editing-the-site.md) | ✅ Built and working |
| [images.md](./images.md) | ✅ Built and working |
| [form-feedback.md](./form-feedback.md) | ✅ Built and working |
| [gallery-page.md](./gallery-page.md) | ✅ Built — except scroll-reveal, still unbuilt |
| [lightbox-navigation.md](./lightbox-navigation.md) | ✅ Built and working |
| [deploying.md](./deploying.md) | ⚠️ Accurate, but **the site isn't live yet** — see its checklist |
| [newsletter.md](./newsletter.md) | ❌ **Not wired.** `Newsletter.tsx` shows a *false* confirmation and discards the address — see the guide's Step 3 |
| [form-spam-protection.md](./form-spam-protection.md) | ❌ Not built. Forms are live and unprotected |
| [givebutter.md](./givebutter.md) | ⚠️ Code is built and waiting &mdash; just needs the two values pasted in |
| [hero-carousel.md](./hero-carousel.md) | ❌ Not built. Rewritten 2026-09-22 for the new two-crop hero |
| [admin-accounts.md](./admin-accounts.md) | ❌ Research only, nothing implemented |

## The guides, by area

### Everyday content
The things you'll do most often. Start here.

| Guide | Covers |
| --- | --- |
| [writing-a-post.md](./writing-a-post.md) | Publish a new journal / blog article |
| [using-the-admin.md](./using-the-admin.md) | The Keystatic editor — drafts, images, publishing |
| [editing-the-site.md](./editing-the-site.md) | Landing-page copy, colors, adding a page or section |

### Photos & media
⚠️ **Read [images.md](./images.md) first** — where files live determines
everything the other three can do.

| Guide | Covers |
| --- | --- |
| [images.md](./images.md) | Adding photos and getting them optimized. **The prerequisite.** |
| [gallery-page.md](./gallery-page.md) | The gallery: Highlights/Archive split, lightbox, scroll-reveal |
| [lightbox-navigation.md](./lightbox-navigation.md) | ← / → navigation between photos in the lightbox |
| [hero-carousel.md](./hero-carousel.md) | Looping the hero photo through several images |

### Forms & email
All three touch the same two forms (`/contact`, `/volunteer/apply`), which share
one Web3Forms key and deliver to one inbox.

| Guide | Covers |
| --- | --- |
| [form-feedback.md](./form-feedback.md) | Success and error screens after someone hits send |
| [form-spam-protection.md](./form-spam-protection.md) | Turnstile CAPTCHA — why the honeypot alone isn't enough |
| [newsletter.md](./newsletter.md) | Email signups, and auto-sending new posts via RSS |

### Launch & operations

| Guide | Covers |
| --- | --- |
| [deploying.md](./deploying.md) | Getting online, connecting services, the pre-launch checklist |
| [givebutter.md](./givebutter.md) | Turn on real donations — the two values, and the trap that makes the button silently dead |
| [admin-accounts.md](./admin-accounts.md) | Admin logins and sessions — and what to use instead of rolling your own |

## First, run the site locally

```bash
npm install     # once
npm run dev     # http://localhost:4321
```

- **Public site:** http://localhost:4321
- **Blog:** http://localhost:4321/journal
- **Gallery:** http://localhost:4321/gallery
- **Admin (CMS):** http://localhost:4321/keystatic

Stop the dev server with `Ctrl+C` (or `npm run astro dev stop` if it's detached).

```bash
npm run build   # production build — run this before deploying
npm run lint    # oxlint
```

## The one-paragraph overview

The site is **Astro**. The landing page reuses our **React** components; the
**blog lives in `src/content/journal/` as MDX files**. You can write those files
two ways: through the **Keystatic admin UI** at `/keystatic` (friendly, no code),
or by **editing the MDX by hand** (fast, for developers). Both produce the exact
same files — pick whichever you prefer. `npm run build` turns it all into a
static site.

## Where things live

| You want to change… | Edit |
| --- | --- |
| Landing copy, programs, gallery list, service keys | [`src/lib/content.ts`](../src/lib/content.ts) |
| Colors, fonts, design tokens | [`src/styles/global.css`](../src/styles/global.css) |
| A landing-page section | `src/components/sections/` (composed in `src/App.tsx`) |
| A blog post | `src/content/journal/*.mdx` |
| Page `<head>`, favicon, structured data | [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro) |

---

**Note on structure:** these stay as flat files rather than subfolders, because
the guides cross-link each other heavily and moving them would break those
links for no real gain at this number of documents. The grouping above is the
organization; the filenames are just addresses.
