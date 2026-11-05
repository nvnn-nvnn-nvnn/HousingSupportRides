# Admin Dashboard

Staff sign in at **`/admin`** with email and password to see form submissions,
manage who else is an admin, and reach the content editor. The public site is
unaffected — only `/admin` and `/keystatic` sit behind the login.

Built 2026-11-04 on **Better Auth** (a self-hosted auth library) with a
**Turso / libSQL** database. The reasoning behind those choices is in
[admin-accounts.md](./admin-accounts.md); this guide is how to run it.

## What admins can do

| Page | Purpose |
| --- | --- |
| `/admin` | Counts of contact and volunteer submissions, the five most recent, quick links |
| `/admin/submissions` | Every stored submission, filterable by form, with delete |
| `/admin/users` | Add or remove admins, set a password, sign someone out everywhere |
| `/keystatic` (linked as **Edit content**) | The existing content editor, now behind the same login |

⚠️ **Edit content still needs GitHub in production.** Keystatic saves by
committing to GitHub, so on the live site it asks for a GitHub login *after*
this one. If staff don't have GitHub accounts, the fix is Keystatic Cloud — a
one-line config change described in [admin-accounts.md](./admin-accounts.md),
Part 3. The admin login adds a gate in front; it doesn't replace that.

## What is — and isn't — stored

| Form | Emailed (Web3Forms) | Stored in dashboard |
| --- | --- | --- |
| Contact (`/contact`) | ✅ | ✅ |
| Volunteer (`/volunteer/apply`) | ✅ | ✅ |
| **Concern report** (`/transparency`) | ✅ | ❌ **deliberately not** |

**Why concern reports are excluded:** that form exists so someone can report
unfair treatment — possibly *by a staff member*. A dashboard every admin can read
would put the report in front of the person it's about. That's why it has its
own Web3Forms key routed to a board member. If concern reports ever go in the
dashboard, they need their own access rule, not just a row in the table.

**Email stays the record of truth.** The dashboard copy is saved only after
Web3Forms confirms the email was sent, and if the database is down the visitor
still sees success. Deleting a submission here does not delete the email.

**Not stored at all:** raw IP addresses. The public endpoint keeps a salted
hash, used only for rate limiting, which can't be turned back into an address.

---

## First-time setup — local

Nothing to sign up for. Locally the database is a file, `local.db`, created on
demand and gitignored.

```bash
npm run db:migrate
npm run admin:create -- you@example.com "Your Name"
npm run dev
```

`admin:create` prints a random temporary password **once**. Copy it, then sign
in at http://localhost:4321/admin/login and change it under
**Admins → Set password**.

To start over: stop the dev server, delete `local.db`, and run both commands
again.

---

## First-time setup — production

Do these **in order**. The public site keeps working throughout — until all
four values are set, `/admin` returns a "not configured" message and nothing
else is affected.

### 1. Create the database (Turso, free tier)

Vercel can't keep a local file between requests, so production needs a hosted
database. Using the [Turso CLI](https://docs.turso.tech/cli/introduction):

```bash
turso auth signup
turso db create hsr-admin
turso db show hsr-admin --url      # → DATABASE_URL  (libsql://…)
turso db tokens create hsr-admin   # → DATABASE_AUTH_TOKEN
```

Pick a region near Minnesota when asked. ⚠️ Check the CLI commands against
Turso's current docs if any fail — the names above are from their CLI as of
writing.

### 2. Generate the session secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

That's `BETTER_AUTH_SECRET`. Treat it like a password. Changing it later signs
every admin out.

### 3. Set four environment variables in Vercel

**Vercel → Project → Settings → Environment Variables**, scope **Production**:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | the `libsql://…` URL from step 1 |
| `DATABASE_AUTH_TOKEN` | the token from step 1 |
| `BETTER_AUTH_SECRET` | from step 2 |
| `BETTER_AUTH_URL` | the live site's exact URL, e.g. `https://housingsupportrides.org` |

`BETTER_AUTH_URL` must match what's in the browser's address bar exactly —
sign-in requests from any other origin are rejected. If the site is still on a
`*.vercel.app` address, use that, and update it when the domain goes live.

⚠️ **Preview deployments can't log in.** Their URLs differ from
`BETTER_AUTH_URL`, so sign-in is refused there. That's the origin check working,
not a bug.

### 4. Create the tables and the first admin — against production

Copy [`.env.example`](../.env.example) to `.env`, fill in the **same** four
values, then:

```bash
npm run db:migrate
npm run admin:create -- you@example.com "Your Name"
```

Both scripts read `.env`, so with production values in it they act on the
**production** database. The migrate script prints which database it's
targeting — read that line before trusting it.

⚠️ Afterwards, **empty `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in your local
`.env`** (or delete the file). Otherwise your next `npm run dev` reads and
writes the live database, and a casual test submission becomes real data.

### 5. Redeploy, then sign in

Push, or redeploy in Vercel. Sign in at `/admin/login` on the live site and
change the temporary password straight away.

---

## Day to day

- **Adding an admin:** `/admin/users` → *Add an admin*. Give them the password
  in person or by phone — never in the same email as their address. Ask them to
  change it after signing in.
- **Someone leaves:** remove them **that day**. Removal ends their access
  immediately; sessions are stored server-side, so there's no waiting for a
  token to expire.
- **A laptop is lost, or a password leaks:** *Sign out everywhere* for that
  person, then *Set password*. Order doesn't matter, but do both — **setting a
  password does not end existing sessions** on its own.
- **Locked out of the only admin account:** run
  `npm run admin:create` again against production with a new email.

## How it's protected

Each item is something that fails *silently* if broken — the happy path working
proves none of them.

| Protection | Where | Verified |
| --- | --- | --- |
| No public sign-up | `disableSignUp` in `src/lib/server/core.ts` | sign-up request rejected |
| Passwords hashed (scrypt), never stored | Better Auth default | — |
| 12-character minimum | `core.ts`, also enforced on admin resets | — |
| Session cookie `HttpOnly`, `SameSite=Lax`, `Secure` in prod | Better Auth default | `HttpOnly` confirmed |
| Sign-in rate limit: 5/minute, **database-backed** | `core.ts` | 429 on attempt 6 |
| Submission rate limit: 5 per 10 min per IP hash | `submissions.ts` | 429 on attempt 6 |
| CSRF: foreign-origin requests refused | Astro `checkOrigin` + Better Auth | 403 with a stolen-cookie request |
| Authorization re-checked inside each admin API route | `src/pages/api/admin/` | 401 without session |
| Open-redirect blocked on `?next=` | `login.astro` | — |
| Submission content HTML-escaped | Astro templating | `<script>` rendered as text |
| Admin pages never built as static HTML | `prerender = false` | none in `dist/client` |

### ⚠️ The prerender trap

Static pages are plain files on a CDN — **middleware never runs for them**. An
admin page missing `export const prerender = false` is built as public HTML,
and the login check never sees the request. **There is no error.** The login
form still appears to work.

Every page in `src/pages/admin/` declares it. If you add one, it needs it too.
Then verify — this is the only reliable test:

```bash
npm run build
find dist/client -path "*admin*" -name "*.html"   # must print NOTHING
```

### Why the database is opened lazily

`src/lib/server/index.ts` creates the database and auth on first use, not at
import. Middleware imports that file, and middleware also runs while static
pages are built. Opening the database at import would mean a missing
`DATABASE_URL` fails the **entire build** — taking the public site down over an
admin feature. Keep it lazy.

### Why `database`, not `memory`, for rate limits

Better Auth defaults to in-memory rate limiting. On Vercel each serverless
instance has its own memory, so a memory limit resets whenever a request lands
on a fresh instance and barely slows a password-guessing script. The `rateLimit`
table makes the limit shared.

## Files

| File | Role |
| --- | --- |
| `src/lib/server/core.ts` | Auth config, DB client, submission schema. **Shared with the scripts** — no `astro:*` imports, no relative imports, erasable TypeScript only. |
| `src/lib/server/index.ts` | Astro-side lazy getters; reads secrets via `astro:env` |
| `src/lib/server/submissions.ts` | Validate, rate-limit, store, list, delete |
| `src/middleware.ts` | The gate for `/admin`, `/api/admin`, `/keystatic` |
| `src/pages/api/auth/[...all].ts` | Better Auth's endpoints |
| `src/pages/api/submissions.ts` | Public: forms post a copy here |
| `src/pages/api/admin/submissions/[id].ts` | Admin: delete |
| `src/pages/admin/*.astro` | Login, dashboard, submissions, admins |
| `src/layouts/AdminLayout.astro` | Admin shell, `noindex` |
| `src/lib/auth-client.ts` | Browser client for the admin pages |
| `scripts/db-migrate.ts`, `scripts/create-admin.ts` | CLI setup |
| `astro.config.mjs` → `env.schema` | Declares the four secrets as runtime-only |

## Still open — decisions, not code

From [admin-accounts.md](./admin-accounts.md), Part 7. The dashboard now holds
names, emails, phone numbers and messages **at rest**, which it didn't before.

- **Retention.** Nothing deletes submissions automatically. Decide how long you
  keep them, then either delete by hand on that schedule or ask for an automatic
  cleanup.
- **Deletion requests.** If someone asks you to delete their data, it lives in
  three places: this dashboard, the Web3Forms email, and the inbox it landed in.
- **Who else can read it.** Anyone with access to the Turso account can read
  the table directly, outside this dashboard. Keep that account to one or two
  people.
- **Roles.** Everyone in `/admin/users` is a full admin and can see every
  submission. If you need a read-only role later, Better Auth's admin plugin
  supports custom roles.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `/admin` says "not configured" | One of `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` is missing in Vercel, or the site wasn't redeployed after setting it. |
| Sign-in always fails on the live site | `BETTER_AUTH_URL` doesn't exactly match the address bar (`www.`, `http` vs `https`, `.vercel.app`). |
| Sign-in fails right after setup | `npm run db:migrate` wasn't run against **production** — check the target it printed. |
| "Too many attempts" | 5 failed sign-ins within a minute. Wait 60 seconds. |
| Submissions never appear | The form succeeded but the copy failed silently (by design). Check Vercel function logs for `/api/submissions`. |
| 403 on delete or sign-out | The request had no matching `Origin` — normal for scripts and `curl`, never for a real browser. |
| An admin page loads while signed out | It's missing `prerender = false`. See the prerender trap above. |
| `npm run db:migrate` errors on `.ts` | Needs Node 22.18+ for built-in TypeScript. Check `node -v`. |
| Build says "Node.js … is not supported by Astro" | Astro is pinned to `~7.3.8` because 7.4.2+ needs Node ≥ 22.23.4. Don't bump Astro without upgrading Node locally **and** checking Vercel's Node version. See CHANGELOG 2026-11-05. |
