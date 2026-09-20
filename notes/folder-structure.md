# Folder Structure

```
HousingSupportRides/
├── astro.config.mjs            # integrations (react, mdx, keystatic, sitemap) + Vercel adapter
├── keystatic.config.tsx        # CMS schema for the journal collection
├── tsconfig.json               # extends astro/tsconfigs/strict
├── how-to/                     # task guides (writing posts, admin, deploy)
├── notes/                      # 👈 why-it's-built-this-way docs (you are here)
├── public/                     # static assets served as-is (favicon, logo, img/)
└── src/
    ├── env.d.ts
    ├── content.config.ts       # journal collection schema (Zod) — content pipeline
    ├── App.tsx                 # landing page: Navbar + 9 sections + Footer (React)
    │
    ├── pages/                  # Astro file-based routes
    │   ├── index.astro          #   /                        → mounts <App client:load/>
    │   ├── what-we-do.astro     #   /what-we-do              programs in depth + impact
    │   ├── volunteer.astro      #   /volunteer               overview + role cards
    │   ├── volunteer/
    │   │   ├── become-a-driver.astro
    │   │   ├── help-coordinate.astro
    │   │   └── give-monthly.astro
    │   ├── history.astro        #   /history
    │   ├── faq.astro            #   /faq
    │   ├── contact.astro        #   /contact                 placeholder form
    │   ├── journal/
    │   │   ├── index.astro       #   /journal                blog list
    │   │   └── [...slug].astro   #   /journal/<slug>          one per MDX post
    │   └── rss.xml.js           #   /rss.xml
    │
    ├── layouts/
    │   ├── BaseLayout.astro     # <html>/<head>: meta, OG, fonts, canonical, Givebutter script
    │   └── SiteLayout.astro     # BaseLayout + <Navbar/> + <Footer/> (chrome for non-landing pages)
    │
    ├── content/journal/        # THE BLOG — one .mdx file per post
    │   ├── a-ride-that-changed-everything.mdx
    │   ├── from-shelter-to-keys.mdx
    │   ├── volunteer-drivers-who-show-up.mdx
    │   └── testing.mdx          # ⚠️ leftover test post — safe to delete or replace
    │
    ├── assets/img/gallery/     # gallery photos — in src/ (NOT public/) so Astro optimizes them
    │
    ├── styles/global.css       # Tailwind import, design tokens, @theme, base layer, article prose
    │
    ├── lib/
    │   ├── content.ts          # ALL landing copy + data (nav, stats, tiers, stories, Givebutter config…)
    │   └── utils.ts            # cn()
    │
    ├── hooks/useCountUp.ts     # count-up-on-scroll for the impact stats
    ├── types/givebutter.d.ts  # JSX types for the <givebutter-*> custom elements
    │
    └── components/
        ├── PageHeader.astro    # shared eyebrow+title+lead header for standalone pages
        ├── GalleryGrid.astro   # /gallery tiles (used twice: Highlights + Archive)
        ├── layout/  Navbar.tsx (island) · Footer.tsx (static) · Header.tsx (⚠️ empty, unused — safe to delete)
        ├── common/  Eyebrow · FadeUp · MediaPlaceholder
        ├── ui/      Button.tsx
        └── sections/  Hero · ImpactCounters · OurWork · DonateBlock ·
                       FieldStories · GetInvolved · Transparency · Partners · Newsletter
```

## Two rendering worlds (important)

| | Landing page | Blog (`/journal`) |
| --- | --- | --- |
| Built from | `src/App.tsx` (React) | `src/content/journal/*.mdx` |
| Rendered as | one hydrated React **island** (`client:load`) | **static** Astro pages |
| Edit content in | `src/lib/content.ts` | the `.mdx` files (or `/keystatic`) |
| Chrome | Navbar/Footer inside `<App>` | `SiteLayout` adds Navbar/Footer |

## How to choose where code goes

| Need | Put it in |
| --- | --- |
| New blog post | `src/content/journal/*.mdx` (or the `/keystatic` admin) |
| Change landing wording/numbers | `src/lib/content.ts` |
| New landing section | `src/components/sections/` + add to `src/App.tsx` |
| New standalone page | `src/pages/*.astro` (wrap in `SiteLayout`) |
| Brand color / font / prose style | `src/styles/global.css` |
| A blog field (e.g. new frontmatter) | `src/content.config.ts` **and** `keystatic.config.tsx` |

## Conventions
- **TSX only** for React; `.astro` for pages/layouts; `.mdx` for posts.
- **Data out of markup.** Landing sections map over arrays from `content.ts`.
- **Tokens, not hex.** `var(--primary)` / `bg-primary`, defined once in `global.css`.
- **Cross-page links** use a leading `/` (`/#impact`, `/journal`) so they work from any page.
