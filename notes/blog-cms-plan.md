# Blog / Journalism Section — Plan & Decision

**Status:** ✅ Implemented (Option A) · **Decided:** 2026-08-10 · **Built:** 2026-08-15

> **Built:** the whole site was migrated to **Astro 7** (Option A). The landing
> page reuses the React components as a single `client:load` island; the blog
> lives at `/journal` as static pages from an MDX **content collection**;
> **Keystatic** (git-based CMS, local mode) provides the `/keystatic` editor;
> RSS + sitemap are generated. `@astrojs/node` is the adapter (needed only for
> Keystatic's admin route). **See [../how-to/](../how-to/) for usage guides.**
> The sections below are the original plan, kept as the decision record.

## Decision

Add a blog/journalism section, rendered with **Astro (static site generation)**
and edited through a **git-based CMS** so non-technical staff can publish
without touching code.

Chosen because:
- **Astro (SSG)** gives every article a real, pre-rendered URL with proper
  `<title>`/meta/OG tags — essential for a journalism section that needs to rank
  in search and preview well when shared. It also reuses our existing **React**
  components as "islands," so the current design carries over.
- **Git-based CMS** keeps content versioned in the repo (no database, no server,
  ~free) while still giving staff a friendly web editor.

Rejected: a hosted headless CMS (Sanity/Contentful) — unnecessary paid
dependency at this size; and WordPress — different stack, more overhead.

## Recommended CMS: Keystatic

- Native **Astro integration**, git-based, React-based admin UI.
- Stores posts as **MDX + images inside the repo**; edits become commits.
- Free and self-hosted (admin lives at a route like `/keystatic`).
- Alternatives if needed: **Decap CMS** (mature, config-only) or **TinaCMS**
  (inline editing, has a paid cloud tier).

## Open decision — how Astro coexists with the current Vite SPA

**Option A (recommended): migrate the whole site to Astro.**
The landing page becomes Astro pages that reuse our React sections as islands
(Framer Motion still works with `client:load` / `client:visible`). One repo,
one build, one deploy; best SEO across the *entire* site; single set of design
tokens and layout. Most work up front, cleanest long-term.

**Option B: keep the Vite SPA, add a separate Astro blog at `/journal`.**
Faster to stand up, but two toolchains, duplicated design tokens / nav / footer,
and awkward boundaries between the two apps. Higher long-term maintenance.

→ Leaning **A**, since the site is still young and small.

## Content model (Keystatic `posts` collection)

| Field | Type | Notes |
| --- | --- | --- |
| `title` | text | |
| `slug` | slug | → `/journal/<slug>` |
| `publishedAt` | date | |
| `author` | text / relationship | |
| `category` | select | e.g. Field Story · Advocacy · Cleanup |
| `cover` | image | with required `alt` text |
| `excerpt` | text | list previews + meta description |
| `draft` | checkbox | keep unpublished out of the build |
| `tags` | array<text> | optional |
| `body` | mdx | article content, supports embedded components |

## Routes / URLs

- `/journal` — index (paginated list, newest first, optional category filter)
- `/journal/[slug]` — article page
- `/rss.xml` + `/sitemap.xml` — feed + sitemap for SEO
- Wire the existing **"News"** nav item to `/journal` (currently `#field-stories`).
  The homepage "Field Stories" section becomes curated highlights that link
  into real journal articles.

## Reuse from the current build

- Design tokens + Tailwind theme in `src/styles/global.css` (Astro supports Tailwind v4).
- `BrandMark`, `Navbar`, `Footer`, `Button`, `Eyebrow`, `FadeUp`,
  `MediaPlaceholder` — reused as islands or converted to `.astro` components.
- Copy/data in `src/lib/content.ts` stays for the landing page.

## Rough sequence (once Option A/B is chosen)

1. Scaffold Astro + `@astrojs/react` + Tailwind v4; port CSS tokens to `src/styles/global.css`.
2. Move landing sections in; mark interactive ones as islands.
3. Add Keystatic integration + the `posts` collection schema above.
4. Build `/journal` index + `/journal/[slug]` templates using the design system.
5. Add RSS + sitemap + per-article meta/OG.
6. Seed 1–2 posts, point "News" nav at `/journal`, wire Field Stories to articles.
7. Deploy (Netlify / Vercel / Cloudflare Pages — all support Astro SSG + Keystatic).

## Why Astro (not Eleventy or Next.js)

The deciding factor is that the site is **already built in React + Framer Motion**.

- **Astro renders our existing React components directly** — statically, and as
  hydrated "islands" where interactivity is needed. The Navbar, Hero reveal,
  count-up stats, and the donate widget all carry over.
- **Eleventy has no first-class React rendering.** We'd rewrite every component
  in Nunjucks/WebC and re-implement the animations + donate flow in vanilla JS —
  throwing away the design system we just built. (Slinkity, the one React/islands
  bridge for 11ty, is effectively unmaintained.)
- **The Nunjucks friction disappears.** Astro's syntax is JSX-like and drops into
  React for logic — so it keeps the parts of 11ty you like and removes the
  templating layer you find confusing.
- **Same toolchain.** Astro is built on **Vite**, like our current app — same
  Tailwind v4 plugin, same TypeScript setup. Eleventy is a separate toolchain.

Eleventy would still be a fine choice for a *from-scratch*, zero-JS, pure
markdown site — just not for one that's already React.

**Next.js** also reuses React components (and you run it on PermitKeep), but it's
a heavier app framework than a mostly-static content site needs. Astro is the
lighter, content-shaped tool for the same reuse.

## Dependencies to add (approx.)

```
astro  @astrojs/react  @astrojs/rss  @astrojs/sitemap
@keystatic/core  @keystatic/astro
@tailwindcss/vite  (already in use)
```
