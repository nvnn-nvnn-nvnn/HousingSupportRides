# Deploying

## What the build produces

```bash
npm run build     # → dist/
npm run preview   # run the built site locally to check it
```

Because Keystatic's admin needs to run on a server, the project uses an
**adapter** (`@astrojs/node`) and builds in **server mode**. Don't let that
worry you:

- **All public pages** (`/`, `/journal`, every article, `/rss.xml`, sitemap) are
  **prerendered to static HTML** — fast and SEO-friendly.
- **Only** the `/keystatic` admin and its API render on-demand.

## Option 1 — Deploy to a modern host (recommended)

Netlify, Vercel, and Cloudflare all run Astro server output. Swap the adapter to
match your host:

```bash
# example: Netlify
npm install @astrojs/netlify
```
```js
// astro.config.mjs
import netlify from '@astrojs/netlify'
export default defineConfig({
  adapter: netlify(),      // replaces node()
  // ...everything else unchanged
})
```
(For Vercel use `@astrojs/vercel`; for Cloudflare `@astrojs/cloudflare`.)

Then connect the repo to the host and deploy. Set **`site`** in
`astro.config.mjs` to your real domain first — it's used for canonical URLs, the
sitemap, and RSS.

## Option 2 — Pure static hosting (no server)

If you'd rather host plain static files (e.g. GitHub Pages) and **don't** need
the live `/keystatic` route on the deployed site:

- Editors publish by running the admin **locally** (`npm run dev` → `/keystatic`)
  and committing, **or** you use **Keystatic GitHub mode** (below), which edits
  through GitHub's API and doesn't need the admin route served on your domain.
- You can then remove the Keystatic integration + adapter from the build used
  for the static host. Keep them for local editing.

## Letting staff edit in production

Local mode (the default here) only writes files on the machine running the dev
server. To let non-technical staff publish from their browser:

1. Switch Keystatic to **GitHub mode** in `keystatic.config.tsx`:
   ```ts
   storage: {
     kind: 'github',
     repo: 'your-org/housing-support-rides',
   }
   ```
2. Create the Keystatic GitHub App and add the credentials as environment
   variables on your host (follow the Keystatic "GitHub mode" setup docs).
3. Deploy with a host adapter (Option 1). Staff visit `yourdomain/keystatic`,
   sign in with GitHub, and their saves become commits + a deploy.

Alternative: **Keystatic Cloud** handles auth for you if you'd rather not manage
the GitHub App.

## Pre-launch checklist
- [ ] `site` set to the real domain in `astro.config.mjs`
- [ ] Adapter matches the host (or removed for pure-static)
- [ ] `npm run build` passes
- [ ] Real favicon in `public/`
- [ ] Decide how staff publish (local commit vs GitHub mode vs Cloud)
