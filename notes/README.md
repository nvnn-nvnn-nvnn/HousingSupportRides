# Housing Support Rides — Developer Notes

A warm, evidence-led nonprofit website for Housing Support Rides. Soft ivory +
deep teal, humanist type, an impact section on real numbers, a donation flow
that stays in view — plus a **journal / blog**.

> Rebranded from "Riverbend Foundation." The name is updated throughout; some
> body copy (mission line, impact stats, address) is still the watershed draft —
> update it in `src/lib/content.ts` and the footer/hero when the real copy lands.

Start here, then read the companion docs:

| Doc | What it covers |
| --- | --- |
| [folder-structure.md](./folder-structure.md) | Where every file lives and why |
| [component-responsibilities.md](./component-responsibilities.md) | What each section/component does |
| [todo-next-steps.md](./todo-next-steps.md) | Placeholders + what still needs wiring |
| [blog-cms-plan.md](./blog-cms-plan.md) | Blog/journalism decision record — why Astro + Keystatic |

> **Task-based how-to guides** (writing posts, the admin, deploying) live in a
> separate top-level folder: **[../how-to/](../how-to/)**.

## Tech stack

- **Astro 7** — the framework. Public pages are prerendered static HTML;
  the landing page reuses our React components as an island.
- **React 19** + **TypeScript** for the landing-page components (TSX only).
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + design tokens in `global.css`.
- **motion** (Framer Motion, `motion/react`) for animation.
- **MDX content collection** for the blog (`src/content/journal/`).
- **Keystatic** (git-based CMS, local mode) — the `/keystatic` editor.
- **@astrojs/node** adapter (only Keystatic's admin route needs a server).
- **lucide-react** icons · **@radix-ui/react-toggle-group** · **clsx** + **tailwind-merge** (`cn()`).

> History: this started as a Vite React SPA. It was migrated to Astro when the
> blog was added (Option A in [blog-cms-plan.md](./blog-cms-plan.md)).
> `react-router-dom` and the Vite entry files were removed in that move.

## Run it

```bash
npm install      # once
npm run dev      # http://localhost:4321  (public site)
                 # http://localhost:4321/journal    → the blog
                 # http://localhost:4321/keystatic  → the CMS admin
npm run build    # astro build  ✅ passing
npm run preview  # run the built site
npm run lint     # oxlint       ✅ clean
```

## The 30-second mental model

```
astro.config.mjs      integrations: react, mdx, keystatic, sitemap; node adapter
  └─ src/pages/                       file-based routes
       ├─ index.astro                 landing → <App client:load/> (React island)
       ├─ journal/index.astro         blog list (static, from the collection)
       ├─ journal/[...slug].astro     one article per MDX file (static)
       └─ rss.xml.js                  the feed
  └─ src/layouts/       BaseLayout (head/meta/fonts) · SiteLayout (Navbar+Footer)
  └─ src/content/journal/*.mdx        the blog posts (schema: src/content.config.ts)
  └─ keystatic.config.tsx             the CMS schema for those posts
```

- **Landing copy & data:** [../src/lib/content.ts](../src/lib/content.ts).
- **Design tokens** (ivory/teal/orange, fonts): [../src/styles/global.css](../src/styles/global.css).
- **Landing sections:** `src/components/sections/` — one file per band, composed in `src/App.tsx`.
- **Blog posts:** `src/content/journal/*.mdx` — see [../how-to/writing-a-post.md](../how-to/writing-a-post.md).
