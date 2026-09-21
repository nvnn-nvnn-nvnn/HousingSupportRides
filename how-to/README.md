# How-To Guides

Practical, task-focused guides for running the Housing Support Rides site.
(For *why* the site is built the way it is, see [../notes/](../notes/).)

| Guide | Use it when you want to… |
| --- | --- |
| [writing-a-post.md](./writing-a-post.md) | Publish a new journal / blog article |
| [using-the-admin.md](./using-the-admin.md) | Run the Keystatic editor and understand drafts, images, publishing |
| [deploying.md](./deploying.md) | Put the site online and let staff edit in production |
| [editing-the-site.md](./editing-the-site.md) | Change landing-page copy, colors, or add a page/section |
| [images.md](./images.md) | Add photos and get them optimized (start here before the two below) |
| [hero-carousel.md](./hero-carousel.md) | Make the hero photo loop through several images |
| [gallery-page.md](./gallery-page.md) | Build the gallery: Highlights/Archive, lightbox, scroll-reveal |
| [lightbox-navigation.md](./lightbox-navigation.md) | Add ← / → navigation between photos inside the lightbox |
| [admin-accounts.md](./admin-accounts.md) | Understand admin logins, sessions, and what to use instead of rolling your own |

## First, run the site locally

```bash
npm install     # once
npm run dev     # http://localhost:4321
```

- **Public site:** http://localhost:4321
- **Blog:** http://localhost:4321/journal
- **Admin (CMS):** http://localhost:4321/keystatic

Stop the dev server with `Ctrl+C` (or `npm run astro dev stop` if it's detached).

## The one-paragraph overview

The site is **Astro**. The landing page reuses our **React** components; the
**blog lives in `src/content/journal/` as MDX files**. You can write those files
two ways: through the **Keystatic admin UI** at `/keystatic` (friendly, no code),
or by **editing the MDX by hand** (fast, for developers). Both produce the exact
same files — pick whichever you prefer. `npm run build` turns it all into a
static site.
