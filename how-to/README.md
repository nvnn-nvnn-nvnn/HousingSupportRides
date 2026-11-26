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
| Add or swap a photo in the homepage slideshow | [hero-carousel.md](./hero-carousel.md) |
| Change the photos beside the Donate button | [support-section.md](./support-section.md) |
| Change the homepage photo mosaic, a page-header photo, or a card photo | [moments-section.md](./moments-section.md) |
| Shrink / crop a photo for the site | [moments-section.md → Step 1](./moments-section.md#step-1-prepare-a-photo-always) (`npm run img`) |
| Save a new form to the admin dashboard / add an admin API route | [forms-and-admin-routes.md](./forms-and-admin-routes.md) |
| Learn to build dark mode myself | [dark-mode-exercises.md](./dark-mode-exercises.md) |
| Learn to make blog photos click-to-enlarge | [post-lightbox-exercises.md](./post-lightbox-exercises.md) |
| Learn to build a slideshow somewhere else | [slideshow-exercises.md](./slideshow-exercises.md) |
| Collect email addresses / send a newsletter | [newsletter.md](./newsletter.md) |
| Change what a form says after you hit send | [form-feedback.md](./form-feedback.md) |
| Stop spam coming through the forms | [form-spam-protection.md](./form-spam-protection.md) |
| Put the site online | [deploying.md](./deploying.md) |
| Turn on donations | [givebutter.md](./givebutter.md) |
| Sign in as an admin / see form submissions | [admin-dashboard.md](./admin-dashboard.md) |
| Add or remove an admin | [admin-dashboard.md](./admin-dashboard.md) → Part 3 |
| Let staff edit blog posts without a GitHub account | [keystatic-cloud.md](./keystatic-cloud.md) |
| Let someone else edit the site | [using-the-admin.md](./using-the-admin.md) · [admin-accounts.md](./admin-accounts.md) |
| **Give my admins access (sign in, edit, write posts)** | **[admin-launch-checklist.md](./admin-launch-checklist.md)** — start here |
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
| [keystatic-cloud.md](./keystatic-cloud.md) | ⚠️ Code ready — **switches on once you create the Cloud project and paste its name** into `keystatic.config.tsx` |
| [editing-the-site.md](./editing-the-site.md) | ✅ Built and working |
| [images.md](./images.md) | ✅ Built and working |
| [form-feedback.md](./form-feedback.md) | ✅ Built and working |
| [gallery-page.md](./gallery-page.md) | ✅ Built — except scroll-reveal, still unbuilt |
| [lightbox-navigation.md](./lightbox-navigation.md) | ✅ Built and working |
| [deploying.md](./deploying.md) | ✅ Site is live at `www.housingsupportrides.org` (domain connected, checked 2026-11-18). Admin sign-in still needs Phase 1 of [admin-launch-checklist.md](./admin-launch-checklist.md) |
| [newsletter.md](./newsletter.md) | ❌ **Not wired.** `Newsletter.tsx` shows a *false* confirmation and discards the address — see the guide's Step 3 |
| [form-spam-protection.md](./form-spam-protection.md) | ❌ Not built. Forms are live and unprotected |
| [givebutter.md](./givebutter.md) | ⚠️ Code is built and waiting &mdash; just needs the two values pasted in |
| [hero-carousel.md](./hero-carousel.md) | ✅ Built and working (2026-11-09) |
| [support-section.md](./support-section.md) | ✅ Built and working (2026-11-12) |
| [moments-section.md](./moments-section.md) | ✅ Built and working (2026-11-16) |
| [dark-mode-exercises.md](./dark-mode-exercises.md) | 📘 Learning project. Not built: you build it |
| [post-lightbox-exercises.md](./post-lightbox-exercises.md) | 📘 Learning project. Not built: you build it |
| [forms-and-admin-routes.md](./forms-and-admin-routes.md) | 📘 Worked examples. Not built: the partner form and CSV export don't exist yet |
| [slideshow-exercises.md](./slideshow-exercises.md) | 📘 Practice exercises. Nothing in them is built yet, by design |
| [admin-dashboard.md](./admin-dashboard.md) | ⚠️ Built and tested locally — **needs a Turso database + 4 Vercel env vars** before it works in production |
| [admin-accounts.md](./admin-accounts.md) | 📚 Background reading — the reasoning behind admin-dashboard.md |

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
| [hero-carousel.md](./hero-carousel.md) | The homepage slideshow: adding photos, how the code works, gotchas |
| [support-section.md](./support-section.md) | The Support Us block: photo slideshow beside the Donate button, mobile layout |
| [moments-section.md](./moments-section.md) | Homepage photo mosaic, photo page headers, photo cards, the sign-up form layout, and `npm run img` |
| [slideshow-exercises.md](./slideshow-exercises.md) | Six graded exercises for building slideshows elsewhere (testimonials, /gallery, swipe…) |

### 📘 Learning

Guided projects for learning to program on this site. Each has hints, hidden
answers (try first!), and a "how to check it works" for every step. Nothing in
them is built yet, by design. You build it.

| Project | You'll learn | Level |
| --- | --- | --- |
| [dark-mode-exercises.md](./dark-mode-exercises.md) | CSS design tokens, `prefers-color-scheme`, a no-flash `<head>` script, a React toggle without hydration bugs, contrast checking. 7 exercises | Beginner → intermediate |
| [post-lightbox-exercises.md](./post-lightbox-exercises.md) | `<dialog>` + `showModal()`, finding admin-written content with `querySelectorAll`, keyboard accessibility, wrap-around prev/next. 4 exercises + 1 stretch | Beginner |
| [forms-and-admin-routes.md](./forms-and-admin-routes.md) | Store a new form ("Partner With Us") in the admin dashboard; build an admin-only API route (download submissions as CSV); the security checklist for any admin route. 2 worked examples + 3 exercises | Intermediate |
| [slideshow-exercises.md](./slideshow-exercises.md) | React state + effects, timers, accessibility for moving content. 6 exercises | Beginner → intermediate |

Tip: work on a git branch (`git checkout -b my-project`), and ask Claude to
*review* your branch rather than write it.

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
| [admin-dashboard.md](./admin-dashboard.md) | **Admin sign-in at /admin**, step by step: try it locally, turn it on for the live site, add/remove admins, fix problems |
| [admin-accounts.md](./admin-accounts.md) | Why it was built the way it was — auth concepts, sessions, the privacy trade-off |

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
