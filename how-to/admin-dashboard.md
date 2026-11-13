# Admin Dashboard — How To

The admin dashboard is a private area of the website at **`/admin`**. Staff sign
in with an email and password, and from there they can:

- read messages people sent through the **Contact** and **Volunteer** forms
- add or remove other admins
- open the content editor (**Edit content**) to change blog posts

Visitors to the public site never see any of this. Only `/admin` and the content
editor ask for a login.

> **Want to know how it works under the hood?** Read
> [../notes/admin-system.md](../notes/admin-system.md). This page is just the
> steps.

---

## Before you start: where things stand

The dashboard is **built and tested on this computer, but it isn't switched on
for the live website yet.** Until you finish
[Part 2](#part-2--turn-it-on-for-the-live-website-one-time), the live
`/admin` page just says "not configured." The rest of the site keeps working
normally.

| You want to… | Go to |
| --- | --- |
| Try it out on your own computer | [Part 1](#part-1--try-it-on-your-computer) |
| Turn it on for the real website | [Part 2](#part-2--turn-it-on-for-the-live-website-one-time) |
| Sign in, read messages, manage admins | [Part 3](#part-3--using-the-dashboard) |
| Fix something that isn't working | [Part 5](#part-5--if-something-goes-wrong) |

---

## Part 1 — Try it on your computer

This takes about two minutes. Nothing here touches the live website.

**1. Open a terminal in the project folder** (in VS Code: *Terminal → New
Terminal*).

**2. Set up the practice database.** Run:

```bash
npm run db:migrate
```

This creates a file called `local.db`. It's your practice database, and it
never gets uploaded to GitHub.

**3. Make yourself an admin.** Put in your own email and name:

```bash
npm run admin:create -- you@example.com "Your Name"
```

It prints a **temporary password**. Copy it now, because it's shown only once.

**4. Start the site:**

```bash
npm run dev
```

**5. Sign in.** Go to **http://localhost:4321/admin/login**, enter your email
and the temporary password, then change the password right away under
**Admins → Set password**.

**To start over from scratch:** stop the site (press `Ctrl + C` in the
terminal), delete `local.db`, and repeat steps 2–4.

---

## Part 2 — Turn it on for the live website (one time)

The live site needs two things it doesn't have yet:

- **a database to store everything in.** It's free, from a company called
  Turso.
- **four settings** entered into Vercel, the service that hosts the site.

Do the steps **in order**. Set aside about 20 minutes.

### Step 1 — Create the database

1. Install the Turso tool by following
   [Turso's install guide](https://docs.turso.tech/cli/introduction).
2. In the terminal, run these one at a time:

   ```bash
   turso auth signup
   turso db create hsr-admin
   ```

   If it asks for a region, pick one near Minnesota (anywhere in the central
   US).
3. Get the database's address:

   ```bash
   turso db show hsr-admin --url
   ```

   It prints something starting with `libsql://`. **Save this; it's your
   `DATABASE_URL`.**
4. Get the database's password:

   ```bash
   turso db tokens create hsr-admin
   ```

   It prints a long string of letters and numbers. **Save this; it's your
   `DATABASE_AUTH_TOKEN`.**

> If any Turso command gives an error, check Turso's website. They may have
> renamed it since this guide was written.

### Step 2 — Make a secret key

Run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

It prints a random string. **Save this; it's your `BETTER_AUTH_SECRET`.** It's
what makes login cookies impossible to fake, so treat it like a password and
don't share it. (If you ever change it, every admin gets signed out. That's
fine, just expected.)

### Step 3 — Put the four settings into Vercel

1. Go to **vercel.com** → your project → **Settings** → **Environment
   Variables**.
2. Add each of these, with the **Production** box checked:

| Name | What to paste |
| --- | --- |
| `DATABASE_URL` | the `libsql://…` address from Step 1 |
| `DATABASE_AUTH_TOKEN` | the long token from Step 1 |
| `BETTER_AUTH_SECRET` | the secret key from Step 2 |
| `BETTER_AUTH_URL` | the website address exactly as it appears in the browser, e.g. `https://housingsupportrides.org` |

⚠️ **`BETTER_AUTH_URL` has to match the address bar exactly.** `https` vs
`http`, with or without `www.`, all of it. If it's even slightly off, sign-in
will fail on the live site. If the site still lives at a `something.vercel.app`
address, use that for now and update it once the real domain is connected.

### Step 4 — Set up the live database and your admin account

This step runs from **your computer** but changes the **live** database, so go
slowly.

1. In the project folder, make a copy of `.env.example` and name the copy
   `.env`. (`.env` is never uploaded to GitHub, so your secrets stay on your
   computer.)
2. Open `.env` and fill in the **same four values** you put into Vercel.
3. Run:

   ```bash
   npm run db:migrate
   ```

   Read the first line it prints. It should name your **Turso** database, not
   `local.db`. If it says `local.db`, your `.env` isn't filled in correctly, so
   stop and fix that.
4. Create your admin account on the live site:

   ```bash
   npm run admin:create -- you@example.com "Your Name"
   ```

   Copy the temporary password it prints.
5. ⚠️ **Now clean up `.env`.** Erase the `DATABASE_URL` and
   `DATABASE_AUTH_TOKEN` lines (or delete the file). If you skip this, the next
   time you run the site on your computer it will be connected to the **real**
   database, and any test message you send becomes real data.

### Step 5 — Redeploy and sign in

1. Push your code to GitHub (or click **Redeploy** in Vercel). The new settings
   only take effect after a redeploy.
2. Go to `/admin/login` on the live site and sign in with the temporary
   password.
3. Change your password straight away: **Admins → Set password**.

You're done. 🎉

> **Heads-up about preview links:** Vercel also makes "preview" copies of the
> site with odd addresses. You **can't** sign in on those, only on the main
> address. That's a safety feature, not a bug.

---

## Part 3 — Using the dashboard

### Signing in and out

- **Sign in:** go to `/admin` and you'll be sent to the login page.
- **Sign out:** the **Sign out** button in the top bar of any admin page.
- You stay signed in for **7 days** on that device, then you'll need to sign in
  again.
- **Wrong password 5 times in a minute** and it makes you wait 60 seconds. This
  stops anyone from guessing passwords.

### The pages

| Page | What it's for |
| --- | --- |
| **Dashboard** (`/admin`) | How many contact and volunteer messages have come in, and the five newest |
| **Submissions** (`/admin/submissions`) | Every saved message. Filter by form, delete the ones you're done with. |
| **Admins** (`/admin/users`) | See who has access, add or remove people, reset passwords |
| **Edit content** | Opens the blog editor |
| **View site** | Back to the public website |

### Reading messages

Open **Submissions**. Use the filter to show only **Contact** or only
**Volunteer** messages. Each one shows the person's name, email, phone (if
given), message, and when it arrived.

**Deleting a message here does not delete the email.** Every message is still
emailed to you first, the same as before. The dashboard is a convenient copy,
and the email is the official record.

### What gets saved, and what doesn't

| Form | Emailed to you | Saved in the dashboard |
| --- | --- | --- |
| Contact | ✅ | ✅ |
| Volunteer application | ✅ | ✅ |
| **Concern / complaint report** | ✅ | ❌ **never** |

**Why complaints are kept out:** someone might be reporting a problem *with a
staff member*. Every admin can read the dashboard, so a complaint saved there
could end up in front of the person it's about. Complaints go only by email to
the board member who handles them.

### Adding a new admin

1. Go to **Admins** → **Add an admin**.
2. Enter their name, email, and a temporary password (at least 12 characters),
   then click **Add admin**.
3. **Tell them the password in person or by phone.** Don't email it, and never
   send it in the same message as their email address.
4. Ask them to change it the first time they sign in.

There is **no "sign up" button** anywhere on the site, on purpose. The only
way to become an admin is for an existing admin to add you.

### When someone leaves

Go to **Admins** and **remove them the same day.** Their access ends
immediately, even if they're signed in somewhere right now.

### If a laptop is lost or a password might be leaked

Go to **Admins** and, for that person, do **both** of these:

1. **Sign out everywhere.** This kicks them out on every device instantly.
2. **Set password.** This gives them a new password.

⚠️ Do both. Changing the password alone does **not** sign out devices that are
already logged in.

### If you're locked out of the only admin account

Repeat [Part 2, Step 4](#step-4--set-up-the-live-database-and-your-admin-account)
with a **different email address** to create a fresh admin. Then sign in and
remove or reset the old account. Remember to clean up `.env` afterward.

---

## Part 4 — The content editor ("Edit content")

**Edit content** opens the same blog editor as before. It's now behind the
admin login too.

On the live site, saving posts needs a second sign-in on top of the admin one.
Which one depends on setup:

- **Keystatic Cloud** (the plan): staff sign in with the email you invited, and
  **no GitHub account is needed**. The code is ready. It switches on once you
  create the Cloud project and paste its name in. Steps:
  **[keystatic-cloud.md](./keystatic-cloud.md)**.
- **GitHub** (what happens until then): each editor needs a GitHub account
  with access to the repo.

So adding someone who will write posts takes two steps: an admin account here,
and an invite in Keystatic Cloud.

---

## Part 5 — If something goes wrong

| What you see | What it means | What to do |
| --- | --- | --- |
| `/admin` says **"not configured"** | One of the Vercel settings is missing, or you didn't redeploy | Check all four are in Vercel (Part 2, Step 3), then redeploy |
| Sign-in **always fails** on the live site | `BETTER_AUTH_URL` doesn't exactly match the address bar | Compare them letter by letter: `www.`, `https`, `.vercel.app` |
| Sign-in fails **right after setup** | The database setup ran against `local.db` instead of the live database | Redo Part 2, Step 4, and check the first line it prints |
| **"Too many attempts"** | 5 wrong passwords within a minute | Wait 60 seconds |
| A message was **emailed but isn't in the dashboard** | Saving the copy failed. The visitor isn't told, because they already got a "thank you". | You still have the email. If it keeps happening, check Vercel → Logs for `/api/submissions`. |
| Can't sign in on a **preview link** | Expected | Use the main site address |
| Locally, every `/admin` page shows a blank **`BetterAuthError`** (500) | `local.db` has no tables. It's empty (0 bytes) until `npm run db:migrate` runs | Run `npm run db:migrate`, then **restart `npm run dev`**. A running server keeps its failed sign-in setup until it restarts. |
| `npm run db:migrate` gives an error about `.ts` | Your Node.js is too old | Run `node -v`. You need 22.18 or newer. |
| Build says **"Node.js … is not supported by Astro"** | Someone upgraded Astro past 7.3 | Put Astro back to `~7.3.8` in `package.json`. See [../notes/CHANGELOG.md](../notes/CHANGELOG.md), 2026-11-05. |
| An admin page **opens without signing in** | 🚨 A page is missing its protection line | See "For whoever edits the code" below. Fix it before anything else. |

---

## Part 6 — Decisions only people can make

The dashboard now stores people's names, emails, phone numbers, and messages.
Before it fills up, someone should decide:

- **How long do we keep messages?** Nothing deletes them automatically. Pick a
  rule (for example "delete after 1 year") and either do it by hand or ask for
  an automatic cleanup.
- **What if someone asks us to delete their info?** It lives in three places:
  the dashboard, the Web3Forms email record, and your inbox. Delete all three.
- **Who can access the Turso account?** Anyone who can log in to Turso can read
  the database directly, without the dashboard. Keep that to one or two people.
- **Does everyone need to see everything?** Right now every admin can see every
  message. A "read-only" level can be added later if needed.

---

## For whoever edits the code

You only need this if you're changing the admin pages themselves. The full
explanation is in [../notes/admin-system.md](../notes/admin-system.md).

**The one rule that matters most:** every page in `src/pages/admin/` must have
this line at the top:

```js
export const prerender = false;
```

Without it, the page is built as a normal public page and **anyone can open
it**, with no login. Nothing warns you, and the login form still looks like it
works. After any change, check:

```bash
npm run build
find dist/client -path "*admin*" -name "*.html"   # must print NOTHING
```

Two other rules:

- **Don't make the database connect when the site starts up.** It's set up to
  connect only when an admin page is opened. If you change that, a missing
  setting breaks the whole website build, not just the admin area.
- **After upgrading any package, delete the `dist/` folder before building.**
  Otherwise an old successful build can hide a new failure.

| File | What it does |
| --- | --- |
| `src/middleware.ts` | The gatekeeper. Checks the login before any admin page loads. |
| `src/lib/server/core.ts` | Login rules (password length, rate limits, no sign-up) and the database table for messages |
| `src/lib/server/index.ts` | Connects to the database the first time it's needed |
| `src/lib/server/submissions.ts` | Saves, lists, and deletes form messages |
| `src/pages/admin/*.astro` | The login, dashboard, submissions, and admins pages |
| `src/pages/api/submissions.ts` | Where the forms send their copy |
| `scripts/db-migrate.ts`, `scripts/create-admin.ts` | The two setup commands |
| `.env.example` | Template for the four settings |
