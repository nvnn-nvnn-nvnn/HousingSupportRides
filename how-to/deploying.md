# Deploying

## What the build produces

```bash
npm run build     # → dist/
npm run preview   # run the built site locally to check it
```

Because Keystatic's admin needs to run on a server, the project uses a **host
adapter** and builds in **server mode**. Don't let that worry you:

- **All public pages** (`/`, `/journal`, every article, `/rss.xml`, sitemap) are
  **prerendered to static HTML** — fast and SEO-friendly.
- **Only** the `/keystatic` admin and its API render on-demand.

## ⚠️ Deploying to Vercel (current setup — READ THIS FIRST)

**The adapter MUST match the host. This project is configured for Vercel with
`@astrojs/vercel`.**

> **The #1 gotcha:** `@astrojs/node` builds a standalone Node server that **Vercel
> cannot serve** — the deploy "succeeds" but the site doesn't work. Vercel needs
> `@astrojs/vercel`, which emits `.vercel/output/`. (Same idea for Netlify /
> Cloudflare — each needs its own adapter.) If you ever see a green Vercel build
> but a broken site, **check the adapter first.**

Current config ([astro.config.mjs](../astro.config.mjs)): `adapter: vercel()`.

To deploy:

1. **Push to GitHub `main`.** Vercel deploys from the repo
   (`devvdevvdevv/HousingSuportRides`) — nothing ships until you push.
2. **Import the repo in Vercel.** Framework preset auto-detects **Astro**; leave
   build command / output at the defaults (the adapter handles output).
3. **Set env vars** (Vercel → Project → Settings → Environment Variables) so the
   `/keystatic` admin works in production (GitHub mode). Without them the public
   site still works, but `/keystatic` errors:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`

   (You get these when you create the Keystatic GitHub App — see "Multiple
   editors" below.)
4. Set **`site`** in `astro.config.mjs` to the real domain (used for canonical
   URLs, sitemap, RSS).

### Switching to a different host later
Swap the adapter — e.g. `npm install @astrojs/netlify` then
`import netlify from '@astrojs/netlify'` and `adapter: netlify()`
(Cloudflare: `@astrojs/cloudflare`). One adapter at a time.

## Pure static hosting (no server)

If you'd rather host plain static files (e.g. GitHub Pages) and **don't** need
the live `/keystatic` route on the deployed site:

- Editors publish by running the admin **locally** (`npm run dev` → `/keystatic`)
  and committing, **or** you use **Keystatic GitHub mode** (below), which edits
  through GitHub's API and doesn't need the admin route served on your domain.
- You can then remove the Keystatic integration + adapter from the build used
  for the static host. Keep them for local editing.

## Multiple editors (admin for news, etc.)

`keystatic.config.tsx` is already set up to switch automatically:
- **dev** (`npm run dev`) → local mode (writes files on your machine).
- **production** → **GitHub mode**, which is what lets *multiple people* sign in
  at `/keystatic` and edit (each save becomes a commit).

To turn it on:

1. **Push the repo to GitHub**, then in `keystatic.config.tsx` replace `OWNER`
   in `repo: 'OWNER/housing-support-rides'` with your GitHub org/user.
2. **Create the Keystatic GitHub App** (Keystatic's guided setup / docs) and set
   the resulting env vars on your host:
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET`.
3. **Deploy with a host adapter** (Option 1). Staff visit `yourdomain/keystatic`,
   sign in with GitHub, and edits become commits + a deploy.

**Who can edit = who has write access to the repo.** Manage your editor list in
**GitHub → repo → Settings → Collaborators & teams** (add/remove people, or use a
team). Everyone there can edit all collections, including the news/journal.

**Editors without GitHub accounts?** Use **Keystatic Cloud** — it handles sign-in
and team management for you, so non-technical staff don't need GitHub logins.
Keystatic itself has no per-collection roles yet; GitHub/Cloud access is all-or-nothing.

## Pre-launch checklist
- [ ] `site` set to the real domain in `astro.config.mjs`
- [ ] Adapter matches the host (or removed for pure-static)
- [ ] `npm run build` passes
- [ ] Real favicon in `public/`
- [ ] Decide how staff publish (local commit vs GitHub mode vs Cloud)
