# Admin Launch Checklist

**Goal:** your admins can sign in to the live site, read form messages, and
write and edit blog posts.

**Time:** about an hour if nothing goes wrong. Do the phases in order: each
one needs the one before it.

This page is the *order* of things. Each step links to the detailed guide
for that part. Tick the boxes as you go (on GitHub, or in your editor).

> **The domain is already connected** (checked 2026-11-18). The live address is
> **`https://www.housingsupportrides.org`**. The bare `housingsupportrides.org`
> redirects to the `www` one, so **always use the `www` address** for sign-in
> and for `BETTER_AUTH_URL`.

---

## Phase 0: Check the site is deployed (5 min)

- [x] Open **vercel.com** → the project → **Deployments**. The newest one
      (commit `2c3fc40`, "added new stuff for the site & admin") is green.
      - Red? Open it, copy the error, and ask for help before going further.
- [x] Open the live address and check the new hero slideshow and Support Us
      section are there.
- [x] Live address: `https://www.housingsupportrides.org`. **You'll need it
      in Phase 1.** `/admin` there says *"not configured yet."* That's
      expected until Phase 1 is done (confirmed 2026-11-18).

---

## Phase 1: Admin sign-in on the live site (30 min)

Detailed guide: [admin-dashboard.md](./admin-dashboard.md), **Part 2**.

> **What this phase does:** turns on admin sign-in for the live site. Right
> now `/admin` says "not configured" because the site has no database and
> doesn't know where one is.
>
> | # | What | Why |
> | --- | --- | --- |
> | 1 | **Create the database** (Turso) | Somewhere to store admin accounts, sign-in tickets and form messages. Only `local.db` on your computer exists so far. |
> | 2 | **Give Vercel 4 settings** | Where the database is, its password (token), the secret key, and the site address. The site reads them while it runs. |
> | 3 | **Create the tables + the first admin** | The new database starts empty. `db:migrate` makes the 6 tables; `admin:create` adds **you**. Both run from your computer, which is why `.env` holds the same settings for a few minutes. |
>
> ```
> before:  website ──▶ ❌ no database, no settings ──▶ "not configured"
> after:   website ──▶ Vercel settings ──▶ Turso (tables + you) ──▶ ✅ sign in
> ```

- [X] **Create the Turso database.** Part 2, Step 1. Use the **organization
      email** for the Turso account.
      - **On Windows, use the website (app.turso.tech) instead of the `turso`
        commands.** The command-line tool needs WSL on Windows. On the site:
        create a database named `hsr-admin` (US region), copy its
        `libsql://…` **URL**, then **Create Token** (read and write, no
        expiry) and copy it. The token is shown only once.
      - Save the **database URL** and the **token** somewhere safe, like a
        password manager. Never paste them into chat or commit them.
- [x] **Make a secret key.** Part 2, Step 2. Save it.
      - **What it is:** a long random password *for the website itself*. No
        person types it. It stamps every sign-in cookie so nobody can forge
        one, and it scrambles form senders' addresses for the spam limit.
      - **How:** VS Code → Terminal → New Terminal, paste, Enter:
        ```bash
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
        ```
        It prints one line of about 44 characters, often ending in `=`. Copy
        the **whole** line (including `=`, `+`, `/`) into your password
        manager as "HSR BETTER_AUTH_SECRET".
      - **Same key in both places:** Vercel (permanent) and `.env` (only during
        Step 4, then emptied).
      - **Make it once.** Changing it later just signs every admin out. If it
        ever leaks: make a new one, replace it in Vercel, redeploy.
- [x] **Add 4 settings in Vercel** → Settings → Environment Variables. Part 2,
      Step 3.

      | Name | Value |
      | --- | --- |
      | `DATABASE_URL` | the Turso URL |
      | `DATABASE_AUTH_TOKEN` | the Turso token |
      | `BETTER_AUTH_SECRET` | the secret key |
      | `BETTER_AUTH_URL` | `https://www.housingsupportrides.org`, **exactly**: with `www`, no slash at the end |

      Not the `vercel.app` address, and not the address without `www`. Sign-in
      only works on the one address written here.

- [x] **Set up the live database and your own admin account.** Part 2, Step 4.
      1. Copy `.env.example` to `.env` and fill in the same 4 values.
      2. `npm run db:migrate`. The first line must name **Turso**, not `local.db`.
      3. `npm run admin:create -- you@yourorg.org "Your Name"`. Copy the password.
      4. ⚠️ **Empty `.env` again** (or delete it), so your computer stops
         talking to the live database.
- [x] **Redeploy** in Vercel (Deployments → ⋯ → Redeploy). New settings only
      apply after a redeploy.
- [x] **Sign in** at `https://www.housingsupportrides.org/admin/login`, then
      **Admins → Set password** on your own row.
      - **How passwords work:** you don't invent the first one.
        `admin:create` generates a random **temporary password** and prints
        it **once** (it's never typed into the command, so it never lands in
        your terminal history). Save it, sign in with it, then replace it.
      - **Your real password:** 12+ characters (the site refuses shorter),
        saved in a password manager. ⚠️ The Set password box shows what you
        type, not dots, so mind who can see your screen.
      - **Forgot it?** No reset email exists. Another admin uses Set password
        on your row and gives you a new temporary one, which is why Phase 2
        asks for two more admins.

✅ *Checkpoint: you can sign in to the live dashboard.*

---

## Phase 2: Add your admins (5 min per person)

Detailed guide: [admin-dashboard.md](./admin-dashboard.md), Part 3 → "Adding a
new admin".

For each person:
- [x] **Admins → Add an admin:** name, their email, and a temporary password
      (12+ characters).
- [ ] Give them the password **by phone or in person**, not in the same email
      as the address.
- [ ] They sign in at `/admin/login` and change it with **Set password**.

Add at least **two** admins besides yourself. There's no "forgot password"
email, so another admin is how a locked-out person gets back in.

✅ *Checkpoint: your admins can sign in and read messages under Submissions.*

---

## Phase 3: Let them write blog posts (20 min)

Without this step, the live editor would need a GitHub account per person.
Keystatic Cloud lets them sign in by email instead.

Detailed guide: [keystatic-cloud.md](./keystatic-cloud.md), Steps 1–5.

- [x] At **keystatic.cloud**, sign in with the **organization email**, then
      create a team and a project. Step 1.
- [x] Connect the GitHub repo `devvdevvdevv/HousingSuportRides` and approve
      Keystatic's GitHub App.
- [x] Copy the project name (`team-name/project-name`). Step 2.
- [x] **Project URLs** in Keystatic Cloud: `https://www.housingsupportrides.org`
      only (no localhost, no vercel.app). See keystatic-cloud.md, Step 1.5.
- [x] Paste it into `keystatic.config.tsx`:
      `const KEYSTATIC_CLOUD_PROJECT = 'hsr-admin/housingsupportrides'`.
      Committed and pushed 2026-11-24 (`f6b65b1`). Step 3.
- [x] ⚠️ **The GitHub repo moved** to `nvnn-nvnn-nvnn/HousingSupportRides`
      (found 2026-11-24). In keystatic.cloud, check the project is connected
      to the **new** name. Pushes still work through GitHub's redirect.
- [x] Wait for the Vercel deploy to go green.
- [x] **Invite each admin** in keystatic.cloud → team → Members. Step 4.
      ⚠️ **The free plan covers 3 people**, you included.
      - Each person must **accept the emailed invitation** before they can
        save posts. Until then, the editor's Cloud sign-in won't let them in.
        If someone is stuck, check they accepted it (and their spam folder).
      - Admin sign-in confirmed working on the live site (2026-11-24).
- [x] **Test it yourself first.** Step 5:
      1. `/admin` → **Edit content** → sign in to Keystatic Cloud.
      2. **Journal → Create**. Add a title, an excerpt, a cover image (resize
         first, about 1600px wide), and a line of text. Tick **Draft**. Save.
      3. On GitHub, a new commit appears on `main`.
      4. A minute or two later, Vercel has redeployed.
      5. Delete the test post.

✅ *Checkpoint: an admin can write and publish a post from the live site.*

---

## Phase 4: Hand it over (15 min)

- [ ] Send each admin:
      - the live address, and `/admin/login`
      - [using-the-admin.md](./using-the-admin.md) (how the editor works)
      - [writing-a-post.md → Adding images](./writing-a-post.md#adding-images)
        (photos, and **resize before uploading**)
- [ ] Tell them what they **can** and **can't** edit yet:
      - ✅ Blog posts (write, edit, add photos, publish)
      - ✅ Read and delete form messages, add and remove admins
      - ❌ Meetings, FAQ, leadership bios, homepage text, and other site
        photos. These still need a developer until they're moved into the
        editor.

---

## Phase 5: Later, but before you announce the site

- [x] **Domain:** connected to Vercel. `www.housingsupportrides.org` is the
      main address, and the bare domain redirects to it (checked 2026-11-18).
      - If you ever switch which one is main in Vercel (Settings → Domains),
        change `BETTER_AUTH_URL` and `site` in `astro.config.mjs` to match,
        then **redeploy**. Everyone signs in again once.
- [ ] **Ownership:** add the organization email as a second owner on GitHub,
      Vercel, Squarespace, Turso, Givebutter and Keystatic Cloud.
- [x] **Board decisions:** how long to keep form messages, and how to handle
      deletion requests. See [admin-dashboard.md](./admin-dashboard.md),
      Part 6.

---

## If something goes wrong

| What happens | Most likely cause | Guide |
| --- | --- | --- |
| `/admin` says "not configured" | A Vercel setting is missing, or no redeploy | admin-dashboard.md → Part 5 |
| Sign-in always fails on the live site | `BETTER_AUTH_URL` doesn't exactly match the address bar. Most likely: missing `www`, or a slash at the end | admin-dashboard.md → Part 5 |
| Can't sign in on `localhost` with your real account | That account lives in **Turso** (live). Your computer uses **`local.db`**, a separate database with separate accounts | Make a local one with `.env` empty: `npm run admin:create -- you@email "Name"`. See notes/admin-system.md → plain-English answers |
| Sign-in blocked after several wrong passwords | 5 failed tries lock sign-in for 1 minute | — |
| Sign-in fails right after setup | `db:migrate` ran against `local.db`, not Turso | admin-dashboard.md → Part 5 |
| Editor asks for a GitHub login | `KEYSTATIC_CLOUD_PROJECT` not set, or not deployed yet | keystatic-cloud.md → "If something goes wrong" |
| Saved post doesn't appear on the site | Still a draft, or Vercel is still deploying | writing-a-post.md |
