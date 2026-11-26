# How Admin Sign-In Works

The full chain, from someone typing a password at `/admin/login` to a row
appearing on the submissions page. Read this before changing anything in the
admin area — most of the decisions in that code only make sense once you can
see the whole path, and several of them fail **silently** if undone.

Task guides live elsewhere: [../how-to/admin-dashboard.md](../how-to/admin-dashboard.md)
for setup and day-to-day use, and [../how-to/admin-accounts.md](../how-to/admin-accounts.md)
for the reasoning that led here. The history is in
[CHANGELOG.md](./CHANGELOG.md) under 2026-11-04 and 2026-11-05.

---

## The short version

**Public pages** = every page a normal visitor sees: the homepage, Contact,
Volunteer, Gallery, the blog. No sign-in, same for everyone.
**Admin pages** = `/admin/*`, only for signed-in admins.

```
                         ┌──────────────── VERCEL ────────────────┐
browser ──request──▶     │                                        │
                         │  static file? ──yes──▶ CDN serves it   │  public pages
                         │       │                (no code runs)  │
                         │       no                               │
                         │       ▼                                │
                         │  src/middleware.ts                     │  ← the gate
                         │    cookie ──▶ Better Auth ──▶ Turso    │    "who is this?"
                         │    not an admin? ──▶ redirect / 401    │
                         │       │                                │
                         │       ▼                                │
                         │  the page or API route                 │  ← re-checks
                         │    reads / writes ──▶ Turso            │    for writes
                         └────────────────────────────────────────┘
```

Three things to take from that picture:

1. **Public pages never touch any of this.** They're ready-made files,
   handed out as-is (like printed flyers), so they can't check who's asking.
   A CDN is just the fast delivery network Vercel uses to hand them out.
2. **Middleware is the gate**, and it only exists for pages that run on demand.
3. **The database is the source of truth for who's signed in** — every
   protected request checks it.

---

## Plain-English answers (questions that came up, 2026-11-18 to 11-24)

Quick answers first. The walkthroughs below have the detail.

**What runs sign-in? Is it an outside product?**
No. It's **Better Auth**, a free open-source library inside our own code (it's
in `package.json`): no account, no company, no bill.

| Part | Job | Outside service? |
| --- | --- | --- |
| Astro | Builds the site | No (our code) |
| Better Auth | Checks passwords, issues cookies, admin roles | No (a library in our code) |
| Vercel | Runs the code (hosting) | Yes |
| Turso | Stores accounts, sessions, form messages | Yes |

Unlike Clerk, Auth0 or Supabase Auth, nobody else holds our accounts. The
trade-off is that we're responsible for it: no "forgot password" email, so
admins reset each other's passwords.

**What is "the cookie"?**
A small piece of text the site stores in your browser. The browser sends it
back automatically on every visit. Ours (`better-auth.session_token`) is
**just a ticket number**:

1. You sign in, and the database saves "ticket `x7Kq…` = Devan, valid 7 days".
2. The browser keeps the ticket.
3. On each admin page, the middleware asks the database: "whose ticket? are
   they an admin?"

The cookie **does not say "admin"**. It's a random code, like a coat-check
ticket. The database knows who it belongs to and what their role is. So you
can't fake admin by editing it, and removing someone's role or signing them
out takes effect immediately. It's sent only over HTTPS, page JavaScript
can't read it, and it expires in 7 days. *Analogy: password = ID shown once
at the door; cookie = wristband; database = guest list.*

**So does admin come from signing in?**
No. **Admin is saved on the account when it's created**, by `admin:create`
(the first admin) or **Add an admin** (everyone after). Signing in only
proves who you are. Nobody can sign themselves up. See Walkthrough 4.

**What's connected to the middleware?**
[`src/middleware.ts`](../src/middleware.ts) is the gate for server pages.

| Guards (admin needed) | Lets through (on purpose) |
| --- | --- |
| `/admin`, `/admin/submissions`, `/admin/users` | `/admin/login`: you must reach it before signing in |
| `/api/admin/…` (e.g. delete a message) | `/api/auth/…`: the sign-in endpoint itself |
| `/keystatic`, `/api/keystatic` (blog editor) | `/api/submissions`: public forms save copies here |
| | All public pages: they're files, so the middleware never runs |

It asks `getAuth()` → Better Auth → Turso "who owns this cookie?", stores the
answer in `Astro.locals.user`, and sends non-admins to the login page (or a
401 for `/api/`). Each `/api/admin` route **checks the role again** itself.

**Which pages run on the server?**
Only 7 files, plus Keystatic. Everything else is static.

| Server page | Admin needed? |
| --- | --- |
| `admin/index`, `admin/submissions`, `admin/users`, `api/admin/submissions/[id]`, `/keystatic` | Yes |
| `admin/login`, `api/auth/[...all]`, `api/submissions` | No |

Rule: **static unless the page needs the server**, which means it must know
who's asking, or save something.

**What makes a page server instead of static?**
One line at the top of the file: `export const prerender = false`. Without
it, the page is built once as a public file. (Keystatic's plugin sets it for
its own pages.) ⚠️ Forget it on a new admin page and that page is public, with
no error.

**What's in the Turso database?**
6 tables: `user` (accounts + **`role`**), `account` (passwords, hashed),
`session` (the cookie tickets), `rateLimit` (sign-in attempts), `verification`
(unused here), and `submission` (form copies, ours). Blog posts, photos and
page text are **not** in it; they're files in GitHub. Donations live in
Givebutter.

**What is Keystatic?**
**The blog editor** at `/keystatic`: a "write a post" screen, so admins can
publish without code. Like Better Auth, it's a free open-source library in our
code ([keystatic.config.tsx](../keystatic.config.tsx)). **It has no database:
it edits files.**

```
admin writes a post in /keystatic → Save
  → saved as a file: src/content/journal/my-post.mdx (+ photos in public/img/journal/)
  → that save is a commit to GitHub
  → Vercel sees the commit and rebuilds (1–2 min) → live at /journal/my-post
```

- Edits **journal posts only** for now (meetings, FAQ, bios, homepage text
  still need a developer).
- On your computer: **local mode**, which saves straight to your files.
- On the live site: saving to GitHub needs a login. **Keystatic Cloud** (a
  small outside service, free for 3 people) lets admins sign in **by email**
  instead of each needing a GitHub account. Ours: `hsr-admin/housingsupportrides`,
  turned on 2026-11-24. Its "Project URLs" list is just
  `https://www.housingsupportrides.org`.

| | Admin dashboard (`/admin`) | Keystatic (`/keystatic`) |
| --- | --- | --- |
| Job | Form messages, managing admins | Writing blog posts |
| Data lives in | Turso | GitHub (files) |
| Sign-in | Better Auth | Better Auth (middleware) **and** Keystatic Cloud |

*In one line:* Turso holds the **private** data; Keystatic edits the
**public** content as files in GitHub, which Vercel turns into pages.

**How does `KEYSTATIC_CLOUD_PROJECT` work in production?**
It decides **where the editor saves**. `storage` in
[keystatic.config.tsx](../keystatic.config.tsx) picks one of three modes:

| Where | Mode | Who can save, and how |
| --- | --- | --- |
| Your computer (`npm run dev`) | **local** | Anyone running the code. It writes straight to the files, with no login. |
| Live site, name set (**now**) | **cloud** | Admins invited on keystatic.cloud sign in **by email**. Keystatic's GitHub App commits for them. |
| Live site, name empty | **github** | Each editor needs their **own GitHub account** with repo access (backup mode). |

```
/keystatic (passes the admin sign-in first, via the middleware)
  → "Sign in with Keystatic Cloud" → email login
  → Keystatic Cloud checks: a member of hsr-admin/housingsupportrides?
                            coming from a Project URL (www.housingsupportrides.org)?
  → yes → Keystatic's GitHub App commits the post to the repo
  → Vercel sees the commit → rebuilds → post is live
```

The name only tells the live editor *which* project to log in through. The
project on keystatic.cloud holds the rest: **who** may edit (members),
**from where** (Project URLs), and **which repo** to commit to (it must
follow the repo's move to `nvnn-nvnn-nvnn/HousingSupportRides`).

**Why can't I sign in on `localhost` with my real account? (2026-11-24)**
**Your computer and the live site have separate databases, so they have
separate accounts.**

| Where you sign in | Database | Accounts in it |
| --- | --- | --- |
| `www.housingsupportrides.org/admin` | **Turso** (live) | The ones made while `.env` pointed at Turso (yours), plus everyone added on the live site |
| `localhost:4321/admin` | **`local.db`** (your computer) | Only ones made with `.env` empty. On 2026-11-24 that was just the test account `techkage@proton.me` |

Which one `admin:create` writes to depends on `.env` at that moment: filled
in → Turso, empty or commented out → `local.db`. To sign in locally, make a
local account with `.env` empty: `npm run admin:create -- you@email "Name"`.

Also seen that day: **5 failed tries lock sign-in for a minute** (the
`rateLimit` table, key `127.0.0.1|/sign-in/email`). Wait 60 seconds; it clears
by itself.

**How does `admin:create` make the password?**
`randomBytes(18).toString('base64url')`: 18 bytes of secure randomness → 24
characters (~144 bits). Better Auth **hashes** it (a one-way scramble) and only
the scrambled version is saved in `account`. The original is printed once,
then exists nowhere, so it can be replaced but never looked up. At sign-in,
what you type is scrambled the same way and compared.

**What is the secret key (`BETTER_AUTH_SECRET`)?**
A random password for the website itself. It stamps cookies so they can't be
forged, and salts the form senders' `ipHash`. Make it with
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
put the same value in Vercel and (temporarily) `.env`, and make it once.
Changing it signs everyone out.

**How does the editor work? What does the `body: fields.mdx({…})` block do? (2026-11-25)**
Keystatic reads the `schema` in `keystatic.config.tsx` and **builds the form
from it**: each field = one input box. Nobody writes the editor's screens; the
config describes them.

`fields.mdx` is the one special field: instead of a text box it draws the
**rich-text writing area** (bold, headings, lists, links, image button).

| Line | Plain English |
| --- | --- |
| `body:` | The field's name. `format: { contentField: 'body' }` (higher up) says this field is the post's main text. |
| `fields.mdx({` | "Draw a rich-text editor, and save what's typed as MDX" (Markdown that can also hold components). |
| `label: 'Body'` | The heading shown above the writing area. |
| `description: RESIZE_NOTE` | The grey help text under it ("Resize to about 1600px…"). |
| `options: { image: {…} }` | Settings for the toolbar's **image button**. |
| `directory: JOURNAL_IMAGE_DIR` | Where the uploaded photo **file** is saved in the repo: `public/img/journal/`. |
| `publicPath: JOURNAL_IMAGE_URL` | The **web address** written into the post for that photo: `/img/journal/…`. |

Why two settings for one photo? A file has two names: where it sits in the
repo (`public/img/journal/picnic.jpg`) and what a browser asks for
(`/img/journal/picnic.jpg`, because Astro serves `public/` at the site root).
Keystatic needs the first to **save** it and the second to **link** it. Change
one without the other and every photo breaks.

**What happens when an admin types and saves:**

```
admin types in the writing area, clicks 🖼 and picks picnic.jpg
  → Save
  → photo file  → public/img/journal/picnic.jpg            (directory)
  → post file   → src/content/journal/<slug>.mdx:
        ---
        title: …            ← every OTHER field goes up here (frontmatter)
        cover: …
        ---
        ## September 5      ← the BODY field goes down here, as Markdown
        Some text…
        ![Volunteers at the picnic](/img/journal/picnic.jpg)   (publicPath)
  → live site: both files committed to GitHub → Vercel rebuilds
  → Astro reads the .mdx → <Content /> in src/pages/journal/[...slug].astro
    turns the Markdown into HTML (the ![…] line becomes an <img>)
```

The real example to compare against: `src/content/journal/recovery-picnic-2026.mdx`.
Typing in the editor and editing that file by hand produce the same thing; the
editor is just a friendlier way to write it.

---

## The idea everything rests on: two kinds of page

Astro builds this site two ways, and the whole admin design follows from the
difference.

**In plain words:** a public page is a **printed flyer**: made once, the same
copy handed to everyone, nobody checks who takes one. An admin page is a
**front desk**: made fresh for each person, after checking their ID. You can't
put a lock on a flyer, so anything private has to be a front-desk page.

| | **Prerendered (static)**: public pages, "flyers" | **On-demand**: admin pages, "front desk" |
| --- | --- | --- |
| When it's made | Once, at `npm run build` | Fresh, on every request |
| Where it lives | A file on Vercel's CDN | A serverless function |
| Runs middleware? | **No** | Yes |
| Knows who's asking? | No | Yes |
| Examples | `/`, `/contact`, `/gallery` | `/admin/*`, `/api/*`, `/keystatic` |

A page is static unless it says otherwise. Every admin page opts out with:

```astro
export const prerender = false
```

⚠️ **This is the single most dangerous line in the feature.** Leave it off and
the page is built once, as plain HTML, and published on the CDN where anyone can
fetch it. Middleware never sees the request, so the login check never happens.
**There is no error.** The login form still appears to work.

The only reliable test is the build output — no admin page may exist as a file:

```bash
npm run build
find dist/client -path "*admin*" -name "*.html"   # must print nothing
```

---

## Walkthrough 1 — signing in

What happens when an admin types their email and password and presses
**Sign in**.

```
/admin/login.astro          form submit, in the browser
     │  authClient.signIn.email({ email, password })      src/lib/auth-client.ts
     ▼
POST /api/auth/sign-in/email                               src/pages/api/auth/[...all].ts
     │  Better Auth handles everything under /api/auth/*
     ▼
rate limit check            5 attempts / minute / IP       rateLimit table
     │  6th attempt ──▶ 429 "Too many attempts"
     ▼
look up user by email                                      user table
     ▼
compare password            scrypt hash, slow on purpose   account table
     │  wrong ──▶ 401, "Invalid email or password"
     │           (same message whether or not the email exists)
     ▼
create a session            random token, expires in 7 days   session table
     ▼
Set-Cookie: better-auth.session_token = <token>.<signature>
     │  HttpOnly · SameSite=Lax · Secure in production
     ▼
browser goes to ?next=… — only if it's a path on this site
```

**What's actually in the cookie:** a random token — the same one stored in the
`session` row — signed with `BETTER_AUTH_SECRET`. Not the email, not the role,
nothing readable. The signature means it can't be forged; the token means it
points at a database row that can be deleted.

**Why the password is "slow":** a password hash is meant to be expensive to
compute. A fast hash like SHA-256 lets a stolen database be guessed at billions
of tries a second. scrypt deliberately costs memory and time, so it doesn't.

**Why `?next=` is checked:** the login page sends you back where you were going,
using the URL. Without a check, `/admin/login?next=//evil.example` would deliver
a freshly signed-in admin to a lookalike site. `login.astro` only accepts a path
that starts with a single `/`.

**Why the rate limit is in the database:** Better Auth's default keeps the
counter in memory. On Vercel, each request can land on a different serverless
instance with its own empty memory, so a memory counter keeps resetting and
barely slows a guessing script. The `rateLimit` table is shared by all of them.

---

## Walkthrough 2 — opening `/admin/submissions`

```
GET /admin/submissions   (cookie attached automatically by the browser)
     ▼
src/middleware.ts
     │  1. isPrerendered?  no — this page opted out
     │  2. path needs an admin?  yes
     │  3. getSession(cookie) ──▶ verify signature ──▶ find session row
     │                                              ──▶ load its user
     │  4. user.role === 'admin'?
     │        no session / not admin ──▶ 302 to /admin/login?next=…
     │        (for /api/admin/* ──▶ 401 instead of a redirect)
     │  5. context.locals.user = the user
     ▼
src/pages/admin/submissions.astro
     │  listSubmissions()                              src/lib/server/submissions.ts
     ▼
SELECT … FROM submission ORDER BY createdAt DESC      submission table
     ▼
HTML, with every value escaped by Astro
```

Two details matter here.

**The session is checked against the database on every request.** Better Auth
can cache the session inside the cookie to save that lookup, but it's off by
default and left off here. That's what makes removing an admin, or
**Sign out everywhere**, take effect on the very next click rather than when a
cached copy expires.

**Writes are checked twice.** Deleting a submission goes to
`DELETE /api/admin/submissions/[id]`. Middleware already blocks non-admins
there, and the route checks `locals.user.role` again itself. If someone later
edits the middleware's path list and accidentally stops covering that URL, the
endpoint still refuses — it doesn't quietly become public.

**Why submitted text can't attack the admin.** A visitor could type
`<script>…</script>` into the contact form. Astro escapes every `{value}` it
renders, so the dashboard shows those characters as text instead of running
them. Switching any of that to `set:html` would turn a contact form into a way
to take over an admin's session.

---

## Walkthrough 3 — a visitor sends the contact form

Nothing about the visitor's experience changed. What changed is that a second
copy now goes to the database.

```
/contact form, in the visitor's browser                src/lib/web3forms.ts
     │
     ├─① POST api.web3forms.com  ──▶ email to the HSR inbox      (unchanged)
     │       │
     │       └─ success? ──▶ show "Thank you" panel
     │                  └──▶ ② fire-and-forget copy:
     ▼
POST /api/submissions        { form: 'contact', name, email, message, … }
     │                                                 src/pages/api/submissions.ts
     │  • JSON only, under 64 KB
     │  • form must be 'contact' or 'volunteer'
     │  • honeypot ticked? ──▶ pretend success, store nothing
     │  • drop access_key / subject / botcheck
     │  • each field ≤ 5,000 characters
     │  • ≤ 5 per 10 minutes per salted IP hash ──▶ else 429
     ▼
INSERT INTO submission …                               src/lib/server/submissions.ts
```

**Why the copy is sent only after the email succeeds:** so the dashboard never
shows something the organization didn't actually receive.

**Why its failure is invisible:** the email is the record of truth. If the
database is down or not configured, the visitor still sees "Thank you" and the
message still reaches the inbox — the dashboard just misses that one.

**Why the IP is hashed, not stored:** the rate limit needs to recognise "the
same sender again", not know who they are. A salted hash does the first and
can't be reversed into an address.

**Why concern reports skip step ②:** the `/transparency` concern form doesn't
pass `storeAs`, so it never reaches the database. That form is routed to a
board member precisely so a complaint can't land in front of the staff member
it's about. A table every admin can read would undo that.

---

## Walkthrough 4 — where admins come from

**Only an admin can make an admin.** Nobody can sign themselves up: there's
no sign-up page, and `disableSignUp: true` blocks it even if someone tries
the API directly. The admin role is saved on the account when it's created.
Signing in later only proves who you are.

There are two ways to create an account:

| | Who | How | Why it's allowed |
| --- | --- | --- | --- |
| **The first admin** | You, once | `npm run admin:create -- email "Name"` on your computer | The command talks **straight to the database**, not through the website. Only someone holding the database keys (in `.env`) can do that. |
| **Every admin after** | Any signed-in admin | `/admin/users` → **Add an admin** | It comes **through the website**, so it's checked: your cookie must belong to an admin. |

**The chicken-and-egg problem:** you need an admin to make an admin, so how
does the first one exist? The command solves it. Better Auth's rule (its own
code, not ours) is:

```js
if (!session && (ctx.request || ctx.headers)) throw ctx.error("UNAUTHORIZED")
```

Piece by piece:

| Piece | Meaning |
| --- | --- |
| `!session` | **nobody is signed in** (`!` = "not"; `session` = the admin found from the cookie) |
| `&&` | **and also** (both sides must be true) |
| `ctx.request \|\| ctx.headers` | **it came over the internet**. A browser call always carries a request and headers; `\|\|` = "or" |
| `throw ctx.error("UNAUTHORIZED")` | **stop and refuse** with a 401, and don't create the account |

| Caller | Nobody signed in? | Over the internet? | Refused? |
| --- | --- | --- | --- |
| Stranger online | yes | yes | **yes** (both true) |
| Admin on the website | no | yes | no |
| `admin:create` on your computer | yes | **no** | no |

In plain words: **"if the call came over the internet and nobody is signed
in, refuse it."** The command doesn't come over the internet. It runs on your
computer with the database keys, so the rule doesn't block it. A stranger
online can't do the same: they don't have the keys, and their request has no
admin cookie.

| Who's asking | Result |
| --- | --- |
| The command on your computer (has the database keys) | ✅ allowed |
| The website, with an admin's cookie | ✅ allowed |
| The website, no admin cookie | ❌ refused (401) |

Small detail: the command **makes up** a random password and shows it once,
rather than you typing one, so the password never sits in your terminal history.
Change it after your first sign-in.

---

## Walkthrough 5 — "Sign out everywhere"

```
/admin/users → Sign out everywhere
     ▼
authClient.admin.revokeUserSessions({ userId })
     ▼
DELETE FROM session WHERE userId = …
     ▼
next request from any of their devices:
     cookie signature still valid ──▶ but no session row ──▶ signed out
```

The cookie on a lost laptop is still cryptographically genuine — it just points
at a row that no longer exists. This is why sessions are stored in the database
rather than inside a self-contained token: a self-contained token stays valid
until it expires, no matter what you delete.

⚠️ **Setting a new password does not do this by itself.** Existing sessions
survive a password change. If a password leaked, do both.

---

## Why the code is split across `core.ts` and `index.ts`

The same auth setup has to run in two different places:

| Runs in | Reads secrets from | Imports |
| --- | --- | --- |
| The website (Astro, bundled by Vite) | `astro:env/server` | `src/lib/server/index.ts` |
| The setup scripts (plain Node) | `process.env` / `.env` | `src/lib/server/core.ts` directly |

Plain Node has no idea what `astro:env` is. So everything both sides need — the
database client, the Better Auth options, the table schema — lives in
**`core.ts`**, which follows strict rules: no `astro:*` imports, no relative
imports, and only TypeScript that Node can strip without compiling (no `enum`,
no `namespace`). `index.ts` is the thin Astro-only layer that feeds it secrets.

Break those rules in `core.ts` and the **site keeps working while the scripts
stop** — an awkward way to discover it, usually at the exact moment you need to
create an admin.

### Why `index.ts` opens nothing until it's asked

Middleware imports `index.ts`, and middleware also runs while the static pages
are being built. If the database connection opened the moment the file loaded,
then a missing `DATABASE_URL` on Vercel would fail the **entire build** — and
take the public site down over an admin feature.

So `getDb()` and `getAuth()` create things on first use. Middleware skips
static pages before calling either. Result: the site builds with no admin
configuration at all, and `/admin` simply answers "not configured" until it's
set up. This was verified, not assumed.

### Why secrets go through `astro:env`

Reading `import.meta.env.SOMETHING` in server code can let the build tool bake
the value straight into the output files. `astro.config.mjs` declares the four
variables with `access: 'secret'`, which makes Astro read them **at runtime**
on the server instead. The secret never ends up in a file that ships.

---

## The security upgrade, explained

Running `npm audit` after building the admin feature showed the new login
packages were clean — but **Astro itself** had problems.

| Problem | In plain terms | Did it apply? |
| --- | --- | --- |
| **Critical:** remote code execution via AVIF images | A booby-trapped image file could run code on the server while being resized | Only if such a file were committed — you don't load outside images. Fixed anyway. |
| Authorization bypass | A crafted URL could slip past a check | No — needs a `base` setting this site doesn't use |
| XSS in MDX | Content in a journal post could run script in a reader's browser | Yes — posts are MDX |
| CSS injection in page transitions | Minor | No |

**Why Astro 7.3.8 and not the newest:** 7.4.2 onwards needs a newer Node than
this computer has. Installing the newest version made the build fail — and a
leftover `dist/` folder from the previous build made it *look* like it passed.
7.3.8 contains all four fixes and runs on the current Node. It's pinned with
`~7.3.8`, meaning "patch fixes only", so a future `npm install` can't move it
to 7.4 and break the build without anyone noticing.

**Also removed:** `@astrojs/node`, an adapter that was installed but never used
(the site runs on the Vercel adapter) and carried its own advisory.

**What's left:** 10 advisories, none critical, none in the sign-in path —
mostly inside build tools, plus a paste issue in Keystatic's editor that needs
an admin to paste hostile content into their own editor.

> **The lesson worth keeping:** after any dependency change, delete `dist/` and
> check the build's real exit code. A green-looking check against stale output
> is how a broken build gets pushed.

---

## Running it on your own computer

On a fresh copy (new laptop, fresh clone, or a deleted `local.db`), the admin
area needs two commands before it works:

```bash
npm run db:migrate                                   # creates the tables in local.db
npm run admin:create -- you@example.com "Your Name"  # prints a one-time password
```

Then **restart `npm run dev`** if it was already running.

### What it looks like if you skip this (seen 2026-11-10)

Every `/admin` page, including `/admin/login`, returns a 500 with a blank page
titled **`BetterAuthError`**. The public site is fine.

- **Why:** `local.db` existed but was **0 bytes**, so it had no tables. The
  middleware asks Better Auth for the session on every admin request, and that
  lookup fails without the `session`/`user`/`rateLimit` tables. Locally there's
  no "not configured" message to catch this, because that check only runs in
  production (`assertConfigured()` in `index.ts`). In dev, an empty database
  looks "configured".
- **Why migrating alone didn't fix it:** the already-running dev server kept
  returning 500 after the tables existed. A restart fixed it, and the same
  session check run from a standalone script succeeded straight away. The most
  likely reason is the cached `auth` instance in `index.ts` (`auth ??= …`),
  which lives as long as the server process. This wasn't proven, so just
  restart after any migration.
- **Easy to confuse with:** the stale Vite dependency cache (a black homepage,
  and `504 Outdated Optimize Dep` in the browser console). Same fix,
  restarting the dev server, but different pages: that one breaks the public
  homepage, this one breaks `/admin`.

There's a matching row in the troubleshooting table of
[../how-to/admin-dashboard.md](../how-to/admin-dashboard.md).

---

## What is Turso? (explained for someone who knows Supabase)

> Not to be confused with **Tauri**, a similar-sounding tool for building
> desktop apps. It has nothing to do with this site.

**Turso is the database service this site's admin area uses.** It was chosen
when the admin dashboard was built (2026-11-04, see [CHANGELOG.md](./CHANGELOG.md)).
It holds the admin accounts, their sign-in sessions, and the saved copies of
contact and volunteer form submissions. The public website doesn't use it at
all.

### The short version

If you know Supabase, you already know most of this. Supabase is "a Postgres
database in the cloud, plus extras." **Turso is "a SQLite database in the
cloud," without the extras.**

| | **Supabase** | **Turso** |
| --- | --- | --- |
| The database underneath | **Postgres** | **SQLite** (Turso's version is called **libSQL**) |
| What you get | Database + login system + file storage + live updates + table editor | Just the database, plus a basic dashboard |
| Who handles sign-in here | Would be Supabase Auth | **Better Auth**, a library in this project's own code |
| How the site connects | A database connection (needs pooling on Vercel) | Ordinary web requests, which suits Vercel |
| Free plan when idle | Pauses after about a week, needs a manual restore | Wakes up by itself on the next request |
| Writing queries | SQL | SQL, nearly the same (small differences, see the switching checklist below) |

### The words you'll see in the code, and what they mean

- **SQLite:** a small database that lives in a **single file**. It's the most
  widely used database in the world: it's inside every phone and browser.
  Normally it runs on one computer only.
- **libSQL:** Turso's improved version of SQLite that can also be reached over
  the internet. The packages `@libsql/client` and `@libsql/kysely-libsql` in
  `package.json` are how the code talks to it.
- **Turso:** the company and service that hosts libSQL databases in the cloud.
  It's the "Supabase" of this setup: you sign up, create a database, and get a
  URL and a token.
- **`local.db`:** on your computer, the database is just this file in the
  project folder (it's gitignored). It's the same kind of database as Turso's,
  so nothing needs installing locally. Think of it as a local Supabase without
  the Docker setup.

### How it fits together

```
On your computer:   the site ──▶ local.db           (a file, no account needed)
On the live site:   the site ──▶ Turso database     (in the cloud)
```

The code is the same in both places. Which database it uses depends on the
`DATABASE_URL` setting:
- **Empty** (your computer, no `.env`): it uses `local.db`.
- **Set** (Vercel): it uses Turso. Together with `DATABASE_AUTH_TOKEN`, it's
  the Turso equivalent of a Supabase project URL plus API key.

### What you'd do in Turso, compared with Supabase

| Task | In Supabase | In Turso |
| --- | --- | --- |
| Create a project/database | Dashboard → New project | `turso db create hsr-admin` (or the dashboard) |
| Get the connection details | Settings → API: URL + key | `turso db show hsr-admin --url` + `turso db tokens create hsr-admin` |
| Create the tables | SQL editor or migrations | `npm run db:migrate` (this project's script) |
| Look at the data | Table editor | Turso dashboard, or `turso db shell hsr-admin` |

Step-by-step setup for launch is in
[../how-to/admin-dashboard.md](../how-to/admin-dashboard.md), Part 2.

---

## Why Turso and not Supabase (decided 2026-11-10)

The question came up before launch: should the database move to Supabase?
**Decision: stay on Turso.** At the time there was nothing to move. The
production database hadn't been created and `local.db` had only empty tables,
so this was really a choice of where to launch, not a migration.

| Reason | Detail |
| --- | --- |
| **Supabase's free plan pauses idle projects** | After about a week of no activity, a free project goes to sleep until someone restores it from the Supabase dashboard. This admin area gets light, irregular use, so it would often be asleep. While asleep: no admin sign-in, and form submissions aren't saved to the dashboard (the email still arrives). Turso's free tier wakes up on its own. |
| **Everything is already built on Turso** | Better Auth, `db:migrate`, `admin:create`, the database-backed rate limit, and the submissions queries are all written and tested against libSQL. Switching means retesting the sign-in path before launch. |
| **We'd only use the database part of Supabase** | Its draws are its own login system, file storage, and live updates. Better Auth already does sign-in, and nothing else is needed. That leaves plain Postgres, which is more than this data needs (a few admins and some form submissions). |
| **Postgres needs a workaround on Vercel** | Every Vercel request starts fresh, and Postgres limits open connections, so you'd have to use Supabase's pooled connection address (port 6543). Turso works over normal web requests, so this doesn't come up. |

**When to reconsider:** the site needs Supabase's other features (staff file
uploads, a client portal), the organization already pays for a Supabase
project, or staff want its spreadsheet-style table editor.

### If it ever does switch, about half a day of work

1. **Connection:** in `core.ts`, replace `@libsql/client` + `LibsqlDialect`
   with a Postgres client and Kysely's `PostgresDialect`, set `type:
   'postgres'`, and point `createDb()`/`getDb()` at it. `index.ts`'s lazy
   getters stay as they are.
2. **Queries:** about 6 statements in `submissions.ts` use `?` placeholders.
   Postgres uses `$1, $2, …`. `db.execute({ sql, args })` is a libSQL method,
   so each call site changes too.
3. **⚠️ `createdAt` must become `BIGINT`.** It stores milliseconds
   (`Date.now()` is about 1.8 trillion), which is far past Postgres's
   `INTEGER` limit of about 2.1 billion. With `INTEGER`, every insert fails.
   SQLite didn't care.
4. **Connection address:** use Supabase's pooled address (port 6543), not the
   direct one, in `DATABASE_URL` on Vercel.
5. **Rerun setup:** `npm run db:migrate`, then `npm run admin:create`, against
   Supabase. Better Auth recreates its own tables there.

Switching is cheapest **before** launch, when there's no data to copy over.
Once there is data, it also has to be exported and re-imported.

---

## If you need to change something

| You want to… | Change | Watch out for |
| --- | --- | --- |
| Add an admin page | New file in `src/pages/admin/` | **Must** have `export const prerender = false`. Then run the `find` check above. |
| Add an admin API route | New file under `src/pages/api/admin/` | Check `locals.user?.role === 'admin'` inside the route too. |
| Store another form | Add it to `STORED_FORMS` in `core.ts`, pass `storeAs` in the page | Think about who should read it first. |
| Change how long sign-ins last | `session.expiresIn` in `core.ts` | — |
| Change the sign-in limit | `customRules['/sign-in/email']` in `core.ts` | Keep `storage: 'database'`. |
| Add a read-only role | Better Auth admin plugin custom roles | Middleware checks for exactly `'admin'` today. |
| Upgrade Astro | `package.json` | Check its Node requirement first; see the security section above. |
| Change the database schema | `SUBMISSIONS_SCHEMA` in `core.ts`, then `npm run db:migrate` | `CREATE TABLE IF NOT EXISTS` won't alter an existing table — new columns need an `ALTER TABLE`. |

---

## Still decided by people, not code

The dashboard now keeps names, emails, phone numbers and messages at rest — the
site previously stored nothing. These questions belong to the board:

- How long are submissions kept, and who deletes them?
- When someone asks for their data to be deleted, it's in three places: this
  dashboard, the Web3Forms email, and the inbox.
- Who has access to the Turso account? They can read the table directly,
  bypassing this dashboard entirely.

See [todo-next-steps.md](./todo-next-steps.md) § 8.
