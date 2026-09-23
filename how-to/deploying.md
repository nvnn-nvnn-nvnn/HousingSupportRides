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

## Connecting Givebutter (donations)

The Donate button on the homepage (`#donate`) is wired to **Givebutter**
(givebutter.com) — a nonprofit donation processor. Until it's configured, the
button renders disabled/grayed out on purpose, so nothing looks broken.

1. **Create a Givebutter account** and a campaign for Housing Support Rides.
2. Get two values from the Givebutter dashboard:
   - **Account ID** — Settings → Integrations
   - **Campaign Code** — the 6-character code shown at the top of your campaign
3. Set both in **[`src/lib/content.ts`](../src/lib/content.ts)**:
   ```ts
   export const GIVEBUTTER_ACCOUNT_ID = 'your-account-id'
   export const GIVEBUTTER_CAMPAIGN_CODE = 'ABC123'
   ```
4. Rebuild/redeploy. This automatically:
   - Loads Givebutter's widget script site-wide (`BaseLayout.astro`)
   - Turns the Donate button in `DonateBlock.tsx` into a real
     `<givebutter-button>` that opens Givebutter's secure checkout popup

**How it works:** the tier selector / custom amount / one-time-vs-monthly toggle
on the site is our own UI for showing *impact* ("$60 funds a month of transit
passes…") — clicking the final button opens Givebutter's own trusted checkout,
where the donor completes the actual payment. The dollar amount shown on our
button is not currently passed into Givebutter's popup (no documented way to
preset it was found); the donor selects/confirms the amount inside Givebutter.

**Note for future editors:** `<givebutter-button>` is a real custom element
(Web Component), not a normal React component. In React 19, custom elements
need `class` (not `className`) for styling to apply — see the comment in
`src/types/givebutter.d.ts` if you add more Givebutter widgets elsewhere
(e.g. `<givebutter-goal-bar>` for a fundraising progress bar).

## Connecting Web3Forms (Contact + Volunteer forms)

The `/contact` and `/volunteer/apply` forms submit via **Web3Forms**
(web3forms.com) — a free form-backend service: submissions email straight to
your inbox, no server code to run or maintain. Until it's configured, both
forms show a friendly "not connected yet" message instead of failing silently.

Why Web3Forms over Formspree (the other common option): Web3Forms' free tier
is 250 submissions/month vs. Formspree's 50/month, and it needs no dashboard —
just an access key emailed to you. (Note: this isn't Squarespace's built-in
form feature — that only exists for sites *built on* Squarespace. This site is
custom Astro on Vercel, so it needs its own form backend regardless of where
the domain is registered.)

1. Go to **web3forms.com**, enter your email, and get a free access key
   (arrives by email — no account/password needed).
2. Set it in **[`src/lib/content.ts`](../src/lib/content.ts)**:
   ```ts
   export const WEB3FORMS_ACCESS_KEY = 'your-access-key'
   ```
3. Rebuild/redeploy. Both forms start working immediately — no other changes
   needed. The access key is meant to be public/client-side (Web3Forms' own
   design), so it's safe to commit.

**How the volunteer flow works:** rather than a separate form per role, there's
**one shared intake form** at `/volunteer/apply` with a "how would you like to
help?" checkbox group. The role pages (`become-a-driver`, `help-coordinate`)
link to it with `?role=driver` / `?role=coordinator`, which pre-checks the
matching box. `give-monthly` is intentionally **not** part of this — its CTA
goes straight to `/#donate` (Givebutter), since giving isn't a volunteer
application. One form is simpler to maintain and gives staff one inbox to
triage instead of several; role-specific vetting (license, background check,
etc.) happens in the follow-up conversation, not the web form itself.

**Spam protection:** both forms include a hidden honeypot field (`botcheck`) —
real users never see or fill it; submissions with it checked are silently
dropped client-side before ever reaching Web3Forms.

## Pre-launch checklist
- [ ] `site` set to the real domain in `astro.config.mjs`
- [ ] Adapter matches the host (or removed for pure-static)
- [x] `npm run build` passes
- [x] Real favicon in `public/` — generated from `newlogo.png` (2026-09-22)
- [ ] Decide how staff publish (local commit vs GitHub mode vs Cloud)
- [ ] Givebutter connected (`GIVEBUTTER_ACCOUNT_ID` + `GIVEBUTTER_CAMPAIGN_CODE`)
- [x] Web3Forms connected (`WEB3FORMS_ACCESS_KEY`) so Contact + Volunteer forms work
- [ ] ⚠️ **Send one real test submission** and confirm it arrives — the key
      being set is not proof that mail is being delivered
- [ ] ⚠️ Spam protection on both forms ([form-spam-protection.md](./form-spam-protection.md))
- [ ] Address is current everywhere, **including the NPI registry**
