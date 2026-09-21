# Housing Support Rides — Developer Notes

> ## ⚠️ DEPLOY (read before touching hosting)
> This site deploys to **Vercel** and MUST use the **`@astrojs/vercel`** adapter
> in `astro.config.mjs`. **Do NOT use `@astrojs/node` for Vercel** — the build
> goes green but the site won't serve. Vercel deploys from GitHub `main`
> (`devvdevvdevv/HousingSuportRides`); `/keystatic` needs `KEYSTATIC_*` env vars
> set in Vercel. Full steps + the gotcha: [../how-to/deploying.md](../how-to/deploying.md).

A warm, evidence-led nonprofit website for Housing Support Rides. Soft ivory +
deep teal, humanist type, an impact section on real numbers, a donation flow
that stays in view — plus a **journal / blog**.

> Rebranded from "Riverbend Foundation." The name is updated throughout.
> **Mission, program names, and program details are now the real copy** — they
> live in `MISSION`, `CHARITABLE_PURPOSE`, and `PROGRAMS` in
> `src/lib/content.ts` (edit once, they update everywhere; see
> [../how-to/editing-the-site.md](../how-to/editing-the-site.md)), and they
> derive from [mission-and-programs.md](./mission-and-programs.md) — the
> official program description, kept verbatim. That document wins any conflict.
> **Still placeholder:** impact stats and the budget split — both are stated as
> fact on the live site. See [todo-next-steps.md](./todo-next-steps.md) § 5.

Start here, then read the companion docs:

| Doc | What it covers |
| --- | --- |
| [gallery-pipeline.md](./gallery-pipeline.md) | How a gallery photo gets from a filename in `content.ts` to the lightbox |
| [mission-and-programs.md](./mission-and-programs.md) | **The official program description, verbatim** — source of truth for every mission/program claim on the site |
| [folder-structure.md](./folder-structure.md) | Where every file lives and why |
| [component-responsibilities.md](./component-responsibilities.md) | What each section/component does |
| [todo-next-steps.md](./todo-next-steps.md) | Placeholders + what still needs wiring |
| [blog-cms-plan.md](./blog-cms-plan.md) | Blog/journalism decision record — why Astro + Keystatic |
| [CHANGELOG.md](./CHANGELOG.md) | Running log of what changed and when |

> **Task-based how-to guides** (writing posts, the admin, deploying) live in a
> separate top-level folder: **[../how-to/](../how-to/)**.

## Tech stack

- **Astro 7** — the framework. Public pages are prerendered static HTML;
  the landing page reuses our React components as an island.
- **React 19** + **TypeScript** for the landing-page components (TSX only).
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + design tokens in `global.css`.
- **motion** (Framer Motion, `motion/react`) for animation.
- **MDX content collection** for the blog (`src/content/journal/`).
- **Keystatic** (git-based CMS) — the `/keystatic` editor. Local mode in dev,
  GitHub mode in production (multiple editors sign in and commit).
- **@astrojs/vercel** adapter (deploys to Vercel; only Keystatic's admin route
  needs a server — public pages are still static). ⚠️ Must stay `vercel()`,
  not `node()` — see the DEPLOY warning above.
- **Givebutter** — real donation processing via their widget custom elements,
  wired into `DonateBlock`. Off by default until `GIVEBUTTER_ACCOUNT_ID` /
  `GIVEBUTTER_CAMPAIGN_CODE` are set in `src/lib/content.ts` — see
  [../how-to/deploying.md](../how-to/deploying.md).
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

**Version control:** this is a git repo (branch `main`, deployed via Vercel from
GitHub). Blog posts are files, so committing is how you keep them — Keystatic
saves in local mode don't publish until committed + pushed. See
[../how-to/using-the-admin.md](../how-to/using-the-admin.md).

## The 30-second mental model

```
astro.config.mjs      integrations: react, mdx, keystatic, sitemap; vercel() adapter
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
