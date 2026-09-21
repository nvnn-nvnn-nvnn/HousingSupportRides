# Admin Accounts & Authentication

**A study guide, not an implementation.** Nothing here is wired into the site.
Read it, decide what you actually want, then write it yourself.

Your question was: *can admins log in from inside the site, without each of them
needing a GitHub account — the way Eleventy does it?*

**Yes.** But the honest version has a catch worth understanding before you pick
a path, because the Eleventy answer you're thinking of is the one that's dying.

---

## Part 1 — You are asking about two different logins

This is the thing to get straight first. Almost all confusion about "adding
accounts" comes from collapsing these two into one problem. They are not one
problem.

| | **CMS login** | **App login** |
| --- | --- | --- |
| Gates | editing site content | a dashboard of form submissions |
| Data lives in | git, as files | a database |
| Result of a save | a commit | a row |
| Who needs it | 2–5 staff | 2–5 staff |
| If it breaks | a typo ships | **you leak people's information** |
| Solved today? | ✅ yes, by Keystatic | ❌ no, nothing stores submissions |

You said you want both. Fine — but build them separately, in that order, and
never let the second one share a login with the first until you understand why
that decision is load-bearing.

**Why the order matters:** the CMS one teaches you the whole shape of auth with
low stakes. The dashboard one is where a mistake has a victim who isn't you.

---

## Part 2 — Why "no GitHub account" is harder than it looks

Here's the mechanic nobody explains, and it's the entire reason this question
has a complicated answer.

Keystatic is a **git-based CMS**. There is no content database — the journal
posts *are* MDX files in the repo. So when an editor clicks Save, something,
somewhere, has to make a git commit to GitHub.

GitHub only accepts commits from an authenticated identity. So:

```
Editor clicks Save
        │
        ▼
  something must hold a GitHub token
        │
        ▼
   commit lands in the repo
```

That gives you exactly two choices:

**A. Each editor authenticates as themselves.** They log in with GitHub, the
commit is authored by them, permissions are just repo write access. This is
what you have configured now. Zero code, real audit trail, and every editor
needs a GitHub account.

**B. The server holds one token and commits on everyone's behalf.** Editors log
in with email + password against *your* system; a shared bot identity writes to
git. Now editors need no GitHub account — but you have built a **token broker**,
and you own its security. If someone gets in, they get repo write access.

That's it. Those are the only two shapes. Anything advertising "in-site login,
no GitHub" is option B with the broker hosted by someone else.

> **This is what Eleventy was doing.** Decap CMS (formerly Netlify CMS) + Netlify
> Identity + **Git Gateway** — Git Gateway *was* the token broker. Netlify has
> **deprecated Git Gateway**; existing sites still work, new setups are not
> recommended. Netlify Identity itself got a reprieve in Feb 2026, but the
> CMS-login-through-Git-Gateway workflow is on borrowed time. So the specific
> thing you're remembering from Eleventy is the one option I'd steer you away
> from starting fresh in 2026.

---

## Part 3 — Your actual options for the CMS login

| Option | Editors need GitHub? | Who runs the broker | Cost | Verdict |
| --- | --- | --- | --- | --- |
| **Keystatic + GitHub** (current) | yes | n/a | free | Already built. Just needs the App installed. |
| **Keystatic Cloud** | **no** | Thinkmill | free ≤3 users, then $10/mo + $5/user | **Closest thing to what you asked for.** One config line. |
| **Decap + Git Gateway** | no | Netlify | free | ⚠️ deprecated, and you're on Vercel. Skip. |
| **Decap + DecapBridge** | no | third party | free | Works, but a small project as a dependency. |
| **Roll your own broker** | no | **you** | your time | You are now maintaining a CMS. Don't, unless learning *is* the goal. |

**If the goal is "editors log in inside the site without GitHub," the answer is
Keystatic Cloud, and it's a config change, not a project.** It's the same
`storage:` block you already have in `keystatic.config.tsx`:

```
storage: { kind: 'cloud' }   // plus a cloud.project line — check their docs
```

Free covers 3 users. You'd know within an afternoon whether it fits.

**If the goal is to learn how auth works** — and you said it is — then don't
learn it here. Building your own git token broker means debugging OAuth flows
*and* CMS internals at once, and the auth part is the smaller half. Learn it on
the submissions dashboard instead, where auth is the actual subject.

---

## Part 4 — What "auth" actually means

Three separate things share the name. Keep them apart in your head and the
libraries stop being confusing.

1. **Authentication** — *who are you?* Proving identity once. Password, magic
   link, OAuth.
2. **Session** — *still you?* Remembering it across requests. **This is the
   hard part and the part people skip.**
3. **Authorization** — *are you allowed?* Admin vs. viewer. Separate from both
   of the above.

### Why sessions are the hard part

HTTP is stateless. Every single request arrives with no memory of the last one.
The server has no idea the request that just came in is the same person who
logged in ten seconds ago.

So at login you hand the browser a token, and it sends that token back on every
subsequent request. Two designs:

| | **Session ID + server lookup** | **Signed token (JWT)** |
| --- | --- | --- |
| Cookie holds | a random opaque ID | the user data itself, signed |
| Each request | look the ID up in the DB | verify the signature, no lookup |
| Revoke instantly? | ✅ delete the row | ❌ valid until it expires |
| Needs storage | yes | no |
| Scales to millions | needs work | trivially |

For an admin panel with five users, **use database sessions.** You will never
have a scale problem, and the day you need to kill someone's access — a laptop
is stolen, a volunteer leaves — you want that to be instant. JWTs are the right
answer to a problem you do not have.

### Cookie flags that actually matter

The cookie carrying that token needs four things. Each one blocks a specific
attack:

| Flag | Blocks |
| --- | --- |
| `HttpOnly` | JavaScript can't read it → an XSS bug can't steal the session |
| `Secure` | only sent over HTTPS → no interception on open wifi |
| `SameSite=Lax` | another site can't make an authenticated request as you (CSRF) |
| `Max-Age` | a forgotten login doesn't last forever |

Miss `HttpOnly` and any XSS anywhere on the site becomes full account takeover.

### Passwords

**You never store a password.** You store the output of a slow, salted,
memory-hard hash — **argon2id** (preferred) or **bcrypt**.

⚠️ **Not SHA-256, not MD5.** Those are fast, and fast is precisely wrong: a
modern GPU does billions of SHA-256 guesses a second. The whole design goal of
a password hash is to be *expensive*. Being slow is the feature.

Also, *always* run the hash comparison even when the email doesn't exist —
otherwise the response time tells an attacker which emails are real.

---

## Part 5 — How this works in Astro specifically

Four pieces. This is genuinely all of it.

**1. Middleware** — `src/middleware.ts`, runs before every on-demand request.
Reads the cookie, looks up the session, attaches the user.

```ts
// SHAPE ONLY — you write the body
export const onRequest = defineMiddleware(async (context, next) => {
  // 1. read the session cookie
  // 2. look it up
  // 3. context.locals.user = ... (or null)
  return next()
})
```

**2. `context.locals`** — a per-request bag that middleware fills and pages
read. In a page it's `Astro.locals.user`. You declare its type once in
`src/env.d.ts` under the `App.Locals` interface, and then it's typed everywhere.

**3. API routes** — `src/pages/api/login.ts` exporting `POST`. Receives the
form, verifies the password, creates the session, sets the cookie. Same file
convention as pages; the export name is the HTTP verb.

**4. `Astro.cookies`** — `.get()`, `.set()`, `.delete()`, with the flags above.

### ⚠️ The trap. Read this twice.

Your `astro.config.mjs` sets no `output`, so **pages are static by default**.
Middleware only runs for on-demand routes. Which means:

```astro
---
// src/pages/admin.astro
// Middleware never ran. This was rendered at BUILD time.
// It is static HTML on a CDN. It is public. There is no error.
---
```

The fix is one line in the page's frontmatter:

```astro
export const prerender = false
```

There is no warning for this. The login form will look like it works. The
redirect will look like it works. And the protected page will be sitting on a
public CDN the whole time.

**How to actually verify:** open the protected URL in a private window with no
session. Then — more importantly — run `npm run build` and check whether an
`admin.html` file appears in `dist/`. If it does, it's static, and it's public.
That check is the real test; the browser one can fool you.

---

## Part 6 — A correction to what I told you

I labeled Better Auth a "managed provider" when you picked your approach. That
was wrong, and the difference matters for your decision:

| | What it really is | Who holds the passwords |
| --- | --- | --- |
| **Better Auth** | a **library you self-host** | **you**, in your database |
| **Auth.js** | a library you self-host | you |
| **Clerk / WorkOS** | a hosted service (SaaS) | them |

So "managed provider, my own logic" describes **Clerk**. Better Auth is the
middle option: it writes the dangerous parts for you (hashing, session
lifecycle, CSRF, token expiry) but *you* run the database and own the breach.

Which is right depends on Part 7. For learning, Better Auth is the better
teacher — you see the session table, you see the cookie. Clerk hides exactly
the things you said you want to understand.

### What Better Auth looks like in Astro

Verified against their current Astro docs: middleware calls
`auth.api.getSession({ headers: context.request.headers })`, assigns the result
to `context.locals.user` / `context.locals.session`, and pages read
`Astro.locals`. You declare both types in the `App` namespace. It needs a
database — Postgres via Neon, or SQLite via Turso; both have free tiers.

That's the whole integration surface. Everything else you write yourself, which
is the point.

---

## Part 7 — The submissions dashboard, and the part that isn't technical

Right now `src/lib/web3forms.ts` posts to Web3Forms and the message goes to
email. **Nothing is stored.** That's not a limitation — it's a genuinely good
privacy posture, and you should notice it before you give it up.

A dashboard changes that. You'd be holding, at rest, in your database:

- volunteer applications — names, phone numbers, addresses, availability
- contact messages — whatever people chose to tell you
- eventually, if it grows: **who requested a ride, and to where**

That last one is the line. A ride manifest for an organization doing
non-emergency medical transport and recovery support is health information in
everything but name. Destination plus date is often enough to infer a
diagnosis.

**Questions to answer before you create the table — not after:**

- How long do you keep a submission? What deletes it, automatically?
- If someone asks you to delete their data, what do you actually do?
- Who can read the table besides the app? (Your DB provider's dashboard counts.)
- Is there an access log, so you'd know if something was exported?
- If the NEMT side ever touches rider health data, does HIPAA apply to you?
  That's a question for the board, and possibly a lawyer, before the schema.

None of this is a reason not to build it. It's a reason the schema comes after
the policy, and a reason this is the half where you use a library instead of
your own crypto.

---

## Part 8 — Security checklist

Things that are invisible when broken. The happy path working proves nothing.

- [ ] Passwords hashed with argon2id or bcrypt — **never** a fast hash
- [ ] Hash comparison runs even for unknown emails (timing)
- [ ] Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Max-Age`
- [ ] Sessions stored server-side and revocable
- [ ] **New session ID issued at login** (prevents session fixation)
- [ ] Rate limiting on the login route — without it, credential stuffing is free
- [ ] Password-reset tokens: single-use, short expiry, invalidate on use
- [ ] `export const prerender = false` on every protected page, verified in `dist/`
- [ ] Secrets in env vars, never committed — you have no `.env` yet, keep it that way
- [ ] Generic error text: "invalid email or password," never "no such user"
- [ ] Authorization checked **in the API route**, not just hidden in the UI

That last one catches people constantly. Hiding a button is not a permission
check. If the endpoint doesn't verify, the endpoint is open.

---

## Part 9 — Suggested order

Each step is independently useful, and you can stop after any of them.

1. **Finish the Keystatic GitHub setup you already have.** Nothing new to
   build. Confirms production editing works at all. → [deploying.md](./deploying.md)
2. **Try Keystatic Cloud** if step 1's GitHub requirement is a real blocker for
   your staff. One config line, free for three users. This likely closes your
   original question entirely.
3. **Build a login against a throwaway page** — `/admin/hello` that says your
   email and nothing else. No real data behind it. Get email+password, sessions,
   middleware, logout, and the `prerender` trap all working with zero stakes.
4. **Add roles**, still on the throwaway page. Admin vs. viewer. Learn that
   authorization is a separate concern from authentication.
5. **Only then**, decide whether the submissions dashboard is worth the privacy
   trade in Part 7 — and if it is, answer those questions first.

### Exercises, if you want them

Work these out yourself; they're the load-bearing ideas.

- Why does the session cookie hold a random ID instead of the user's email?
- An attacker steals a `HttpOnly` cookie via a malicious browser extension.
  Which checklist item limits the damage, and how long does it last?
- Why must login issue a *new* session ID rather than reusing an existing one?
- Your `/api/submissions` route returns JSON. Middleware sets `locals.user`.
  Where exactly does the permission check go, and what happens if you only put
  it in the page that renders the table?
- `npm run build` produces `dist/admin.html`. What went wrong?

---

## Reference

- [Astro: Authentication](https://docs.astro.build/en/guides/authentication/)
- [Better Auth: Astro integration](https://better-auth.com/docs/integrations/astro)
- [Keystatic Cloud docs](https://keystatic.com/docs/cloud)
- [Decap: choosing a backend](https://decapcms.org/docs/choosing-a-backend/) — context on the Git Gateway situation
