# Keystatic Cloud — Let Staff Edit Without GitHub

**Edit content** in the admin dashboard opens the blog editor (Keystatic). On
the live site, the editor has to save each post somewhere. Out of the box it
saves to GitHub, which means every editor needs a GitHub account.

**Keystatic Cloud removes that requirement.** You invite staff by email, they
sign in with that email, and Keystatic saves their posts to GitHub *for* them.
Staff never see GitHub.

> **Status:** the code is ready. It switches on the moment you paste your Cloud
> project name into `keystatic.config.tsx` (Step 3). Until then, the live site
> keeps using GitHub mode, so nothing breaks if you deploy first.

---

## What it looks like for a staff member

1. Sign in at `/admin` with their admin account (email + password).
2. Click **Edit content**.
3. The first time, Keystatic asks them to sign in to **Keystatic Cloud**, using
   the email you invited. After that it remembers them on that browser.
4. Write or edit a post and click **Save**. The post goes live a minute or two
   later, once Vercel finishes rebuilding the site.

So there are **two logins**:

- the **admin login**, which gets you into `/admin`
- the **Keystatic Cloud login**, which lets you save posts

A person needs both. Removing someone from `/admin/users` locks them out of the
editor too, because they can't reach it anymore. Still remove them from
Keystatic Cloud as well (see [Removing an editor](#removing-an-editor)).

---

## Setup (one time, about 15 minutes)

### Step 1 — Create the Cloud project

1. Go to **[keystatic.cloud](https://keystatic.cloud)** and sign in. Use the
   organization's account (`hsr.intake@gmail.com` or similar), not a personal
   one, so access doesn't depend on one person.
2. Create a **team**. Name it after the organization, e.g. *Housing Support
   Rides*.
3. Inside the team, create a **project**. Name it something like *website*.
4. When it asks you to connect a GitHub repository, pick
   **`devvdevvdevv/HousingSuportRides`**. It will ask you to install
   Keystatic's GitHub App on that repo, so approve it. This is how Keystatic
   saves posts for your staff.

5. **"Project URLs"** asks where the site is deployed. Keystatic Cloud only
   accepts sign-ins from addresses on this list (the same idea as
   `BETTER_AUTH_URL`). Enter the live address, nothing else:
   ```
   https://www.housingsupportrides.org
   ```
   - With `www` (the bare domain only redirects there), no slash at the end,
     no `/keystatic`.
   - **Don't add `localhost`.** On your computer the editor always uses local
     mode and never contacts Keystatic Cloud.
   - Don't add the `vercel.app` address either. Nobody should edit through it.

### Step 2 — Copy the project name

The project page shows the project's name as **`team-name/project-name`**.
It's also in the page's web address
(`keystatic.cloud/teams/<team>/project/<project>`). Copy it exactly.

> **Ours (done 2026-11-24):** `hsr-admin/housingsupportrides`.
>
> The project name is **not a secret**. It sits in public code. If what you
> found is a long random string instead, that's a token, so don't paste it
> anywhere.

### Step 3 — Paste it into the site

Open **`keystatic.config.tsx`** (in the project's main folder) and find this
line near the top:

```ts
const KEYSTATIC_CLOUD_PROJECT = ''
```

Put the name between the quotes:

```ts
const KEYSTATIC_CLOUD_PROJECT = 'housing-support-rides/website'
```

Save, commit, and push. Once Vercel finishes deploying, the live editor uses
Keystatic Cloud.

> **Ours:** `const KEYSTATIC_CLOUD_PROJECT = 'hsr-admin/housingsupportrides'`,
> pushed 2026-11-24 (commit `f6b65b1`).

> On your own computer (`npm run dev`) nothing changes. The editor always saves
> straight to the files on your computer, with no Cloud login.

### Step 4 — Invite your staff

In keystatic.cloud → your team → **members**, invite each person by email.
They get an email, accept it, and they're set.

Then make sure each person also has an **admin account** at `/admin/users`
(see [admin-dashboard.md](./admin-dashboard.md), Part 3). Without it, they
can't reach the editor at all.

### Step 5 — Test it

1. Sign in at `/admin` on the live site → **Edit content**.
2. Sign in to Keystatic Cloud when asked.
3. Make a tiny change to a post (or create a test post) and save.
4. On GitHub, check that a new commit appeared on `main`. A minute or two
   later, check the change is on the live site.
5. Undo the test change.

---

## Day to day

### Adding an editor

1. Invite them in **keystatic.cloud → team → members**.
2. Add them as an admin at **`/admin/users`**.

### Removing an editor

Do both, **the same day**:

1. Remove them at **`/admin/users`**. This instantly stops them reaching the
   editor through the site.
2. Remove them in **keystatic.cloud → team → members**. This closes the door
   on the Cloud side too.

---

## Cost

Keystatic Cloud is **free for up to 3 people**. Beyond that it's a paid plan
(at the time of writing, about $10/month plus $5 per extra user). ⚠️ Check
[keystatic.cloud](https://keystatic.cloud) for current pricing before you
invite a 4th person.

If you outgrow it and don't want to pay, you can switch back to GitHub mode by
emptying `KEYSTATIC_CLOUD_PROJECT` again. Editors would then each need a GitHub
account with write access to the repo.

---

## If something goes wrong

| What you see | What to do |
| --- | --- |
| Editor still asks for a **GitHub** login | The project name isn't set, or the site wasn't redeployed. Check `KEYSTATIC_CLOUD_PROJECT` is filled in and pushed. |
| "Project not found" or a similar error | The name is mistyped. It must be exactly `team/project` as shown on keystatic.cloud. |
| Staff member can't sign in to Keystatic Cloud | They haven't accepted the invite, or they're using a different email than the one you invited. |
| Saving fails | The Keystatic GitHub App may have been removed from the repo. Reinstall it from the project's settings on keystatic.cloud. |
| Saved, but the live site didn't change | Check Vercel for a failed deploy. Each save is a commit, which triggers a rebuild. |
| Staff member can't open **Edit content** at all | They don't have an admin account at `/admin/users`, or they aren't signed in. |

---

## How it works (for whoever maintains the code)

- `keystatic.config.tsx` picks the storage mode:
  - `npm run dev` → **local** (files on disk)
  - production with `KEYSTATIC_CLOUD_PROJECT` set → **cloud**
  - production with it empty → **github**
- What a live save does, step by step:
  ```
  /keystatic (admin sign-in checked first by the middleware)
    → "Sign in with Keystatic Cloud" → email login
    → Cloud checks: member of the project? request from a Project URL?
    → Keystatic's GitHub App commits the post → Vercel rebuilds → live
  ```
  The project on keystatic.cloud holds **who** (members), **from where**
  (Project URLs), and **which repo** (keep it pointed at the current repo name).
- Every line of `keystatic.config.tsx` now has a plain-English comment
  (2026-11-24). Start there to change a field or add a collection.
- The project name isn't a secret. Keystatic Cloud's own sign-in protects it,
  so it's fine to keep it in the code.
- Cloud mode doesn't use the `KEYSTATIC_GITHUB_CLIENT_ID` /
  `KEYSTATIC_GITHUB_CLIENT_SECRET` / `KEYSTATIC_SECRET` Vercel variables. They
  only matter in GitHub mode. Leaving them set does no harm.
- Cloud sign-in returns to `/keystatic/cloud/oauth/callback`. That path is
  under `/keystatic`, so it goes through the admin gate in `src/middleware.ts`.
  This works because the person is already signed in to `/admin` by then.
- Every save is still a normal git commit on `main`, so Vercel rebuilds and
  posts stay as `.mdx` files in `src/content/journal/`. Nothing about the blog
  itself changes.
