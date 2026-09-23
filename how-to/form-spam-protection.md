# Protecting the Forms From Spam

Goal: understand *why* the contact and volunteer forms are currently open to
abuse, what a CAPTCHA actually does about it, and how to wire one into an Astro
site yourself.

This builds on the forms described in [deploying.md](./deploying.md). Read the
Web3Forms section there first if you haven't.

## The problem: our honeypot doesn't do what it looks like it does

Here's the current defense, from
[`src/lib/web3forms.ts`](../src/lib/web3forms.ts):

```ts
// Honeypot: real users never fill this (it's hidden via CSS); bots often do.
if ((form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked) {
  return
}
```

The idea is sound. There's a hidden checkbox in the form that no human can see,
so a human never ticks it. Crude bots fill in every field they find, tick the
box, and get silently dropped.

**The flaw is where that check runs.** It runs in the browser, in our
JavaScript. And look at what's sitting right above it:

```ts
formData.set('access_key', WEB3FORMS_ACCESS_KEY)
```

`WEB3FORMS_ACCESS_KEY` is a module constant that Astro inlines into the client
bundle at build time. That's by design — Web3Forms keys are meant to be public.
But it means anyone can open devtools, read the key out of the JavaScript, and
then POST directly to `https://api.web3forms.com/submit` with it:

```bash
curl -X POST https://api.web3forms.com/submit \
  -H 'Content-Type: application/json' \
  -d '{"access_key":"<key from the bundle>","message":"spam"}'
```

That request never loads our page, never runs our JavaScript, and never sees
the honeypot. It lands in your inbox.

So the honeypot stops exactly one category of attacker: a dumb bot that renders
our page and submits our form. It does nothing about anyone who reads the key
once and scripts against the API directly — which is the attack that actually
happens, because it's cheaper.

⚠️ **The lesson generalizes:** any validation that runs in the browser is a
convenience, not a control. The client is fully under the attacker's control.
Real enforcement has to happen somewhere they can't reach.

## What a CAPTCHA actually does

A CAPTCHA fixes this because it moves the decision off the client. Three
parties, and the key move is that two of them talk *behind your back*:

1. **Browser → CAPTCHA provider.** The widget on your page runs checks
   (browser fingerprint, mouse behavior, IP reputation, sometimes a puzzle).
   If satisfied, the provider hands the browser a **token** — a short-lived,
   single-use string that means "this provider vouches for this visitor."
2. **Browser → Web3Forms.** Your form submits as usual, with the token
   included as one more field.
3. **Web3Forms → CAPTCHA provider.** *Server to server*, Web3Forms asks the
   provider "is this token real, and have you seen it before?" using a **secret
   key** that never appears in your page.

Step 3 is the whole point. A forged token fails because the attacker can't mint
one the provider will vouch for. A stolen token fails because it's single-use
and expires in a few minutes. And none of it depends on our JavaScript running.

This is also why there are **two keys** and why the distinction matters:

| Key | Where it lives | Public? |
| --- | --- | --- |
| **Site key** | In your page's HTML, visible to everyone | Yes — that's fine |
| **Secret key** | Pasted into the Web3Forms dashboard only | **No — never in this repo** |

⚠️ The secret key does not go in `content.ts`, in an `.astro` file, or anywhere
else in the codebase. It goes in the Web3Forms dashboard and nowhere else. If
it leaks, the whole mechanism collapses back to the honeypot situation above.

## Which CAPTCHA?

Web3Forms supports hCaptcha and Cloudflare Turnstile.

| Option | Verdict |
| --- | --- |
| **Cloudflare Turnstile** ← *use this* | Free with no request cap, and invisible for the large majority of visitors — most people see a checkbox tick itself and nothing more. No image puzzles. Doesn't sell the interaction data. For a nonprofit whose visitors may be stressed, on old phones, or on shaky connections, "no puzzle" is a real accessibility win, not a nicety. |
| **hCaptcha** | Also supported and also free, but shows actual puzzles more often. Every puzzle is friction on a form where you *want* submissions. |
| **reCAPTCHA** | Google's. Not natively supported by Web3Forms, worse privacy story, and v3's invisible scoring gives you a number to threshold rather than a yes/no. No reason to reach for it here. |

The rest of this guide uses Turnstile. hCaptcha is a near drop-in — the
differences are noted at the end.

## Step 1 — Get the keys

1. Cloudflare dashboard → **Turnstile** → **Add site**. A free Cloudflare
   account is enough; **your domain does not need to use Cloudflare DNS.**
2. Add `housingsupportrides.org` **and `localhost`** as hostnames. Without
   `localhost` you can't test locally, which you will want to do in Step 5.
3. Widget mode: **Managed**. Let Cloudflare decide when to challenge.
4. Copy both keys.
5. In **Web3Forms** → your access key's settings → enable CAPTCHA, choose
   Turnstile, paste the **secret key** there. Save.

⚠️ **Step 5 is the one people skip**, and skipping it is worse than doing
nothing: the widget appears on your form, users solve it, and Web3Forms — never
told to verify anything — accepts every submission regardless. You get the
friction with none of the protection, and no error to tell you.

## Step 2 — Add the site key to config

In [`src/lib/content.ts`](../src/lib/content.ts), next to the other keys, using
the same empty-gated convention the rest of the file uses:

```ts
/**
 * Cloudflare Turnstile site key — spam protection for the Contact and
 * Volunteer forms. Get one free at dash.cloudflare.com → Turnstile.
 * The SITE key is public and belongs here. The SECRET key does NOT —
 * paste that into the Web3Forms dashboard only.
 * Leave blank and the forms work exactly as before, with no widget.
 */
export const TURNSTILE_SITE_KEY = ''
```

Same pattern as `GIVEBUTTER_ACCOUNT_ID` and `WEB3FORMS_ACCESS_KEY`: an empty
string means the feature is simply absent, and the site still builds and runs.
That's what lets you commit this before the keys exist.

## Step 3 — Load Turnstile's script ⚠️ (the Astro-specific part)

This is where Astro differs from a plain HTML site, and it's the step most
likely to waste your afternoon.

**Astro processes `<script>` tags by default.** A `<script>` written directly in
an `.astro` template gets picked up by the build, bundled, and rewritten. That's
what you want for *your own* code — it's how
[`contact.astro`](../src/pages/contact.astro) imports `initWeb3Form`. It is not
what you want for a third-party script served from someone else's CDN, which
must be fetched from that CDN, at runtime, exactly as written.

The fix is the `is:inline` directive, which tells Astro to leave the tag alone.

In [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro), in the
`<head>`, right alongside the Givebutter block that already does this:

```astro
---
import { GIVEBUTTER_ACCOUNT_ID, TURNSTILE_SITE_KEY, MISSION } from '../lib/content'
---

<!-- Cloudflare Turnstile — spam protection for the site's forms.
     Only loads once TURNSTILE_SITE_KEY is set in src/lib/content.ts.
     See how-to/form-spam-protection.md. -->
{
  TURNSTILE_SITE_KEY && (
    <script
      is:inline
      async
      defer
      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
    />
  )
}
```

Note the shape deliberately mirrors the Givebutter script at
[`BaseLayout.astro:84-91`](../src/layouts/BaseLayout.astro#L84-L91) — wrapped in
a truthiness check so an unconfigured site ships nothing at all. Consistency
here means the next person only has to learn the pattern once.

Loading it site-wide is slightly wasteful (pages without forms load it too), but
the script is small, `async defer` keeps it off the critical path, and a single
load point is far easier to reason about than per-page includes.

## Step 4 — Put the widget in the form

In [`contact.astro`](../src/pages/contact.astro), just above the submit button:

```astro
---
import { TURNSTILE_SITE_KEY } from '../lib/content'
---

{TURNSTILE_SITE_KEY && (
  <div class="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
)}
```

Repeat in [`volunteer/apply.astro`](../src/pages/volunteer/apply.astro).

Two things are happening implicitly here, and both are worth knowing:

- **The script finds the widget by class name.** Turnstile's API scans for
  `.cf-turnstile` on load and renders itself into each one. You don't call
  anything. (There's an explicit-render API if you need control over timing —
  you don't, here.)
- **The token arrives as a hidden input.** Once solved, Turnstile injects
  `<input type="hidden" name="cf-turnstile-response" value="...">` **into the
  enclosing form**.

⚠️ **That second point is why the widget must live inside the `<form>` element**,
not next to it. Put it outside and everything looks correct — widget renders,
checkbox ticks green — but the token lands outside the form, never gets
submitted, and every submission is rejected as unverified.

## Step 5 — What changes in `web3forms.ts` (less than you'd think)

Here's the satisfying part. Look at how the payload is currently built:

```ts
const formData = new FormData(form)
formData.set('access_key', WEB3FORMS_ACCESS_KEY)
const payload = Object.fromEntries(formData.entries())
```

`new FormData(form)` reads **every** named field in the form, including hidden
inputs, including ones injected by third-party scripts after page load. Since
Step 4 put the widget inside the form, `cf-turnstile-response` is already in
`formData`, already in `payload`, already being sent. **No change needed to
collect the token.**

One change *is* needed, though, and it's not obvious:

```ts
} else {
  statusEl.textContent = result.message || 'Something went wrong. Please try again.'
  statusEl.className = statusClass.error
  // Turnstile tokens are single-use. After any failed submit the token in the
  // form is spent, so a second attempt fails too — with a confusing message
  // about verification rather than the real problem. Reset to mint a fresh one.
  window.turnstile?.reset()
}
```

And the same in the `catch` block, since a network failure burns the token just
as effectively as a rejection.

⚠️ **Without this reset, your forms get a "fails twice" bug**: the first
submission fails for whatever ordinary reason (typo'd email, flaky connection),
the user corrects it and resubmits, and the second attempt fails with a
verification error they can do nothing about. They leave. You never find out,
because nothing reached your inbox to tell you.

You'll also need the global declared for TypeScript — add to `src/env.d.ts`:

```ts
interface Window {
  turnstile?: { reset: (widget?: string) => void }
}
```

### While you're in there: the honeypot

Keep the existing `botcheck` check. It costs nothing and does filter the
laziest bots before they consume a Turnstile verification.

But be clear-eyed that it is not the defense — Turnstile is. Don't let its
presence in the file talk you out of Step 1, the way it nearly did here.

## Step 6 — Test it properly

1. `npm run dev`, open http://localhost:4321/contact. This is why `localhost`
   went in the hostname list in Step 1.
2. **Confirm the widget renders.** If it doesn't, the script didn't load — see
   the troubleshooting table.
3. Submit normally. It should succeed and reach your inbox.
4. **Now test the actual threat.** Copy the `curl` command from the top of this
   guide, using your real access key, and run it *without* a token. Web3Forms
   should reject it. If it succeeds, you skipped Step 1.5 — the secret key isn't
   in the Web3Forms dashboard and nothing is being verified.
5. Deliberately fail a submission, then retry, to confirm the reset works.
6. Redeploy and repeat step 3 on production.

Step 4 is the only one that tests what you actually built. Do not skip it — a
green checkbox on your form proves the widget works, not that anything is being
verified.

## If you'd rather use hCaptcha

Three substitutions:

| Turnstile | hCaptcha |
| --- | --- |
| `https://challenges.cloudflare.com/turnstile/v0/api.js` | `https://js.hcaptcha.com/1/api.js` |
| `class="cf-turnstile"` | `class="h-captcha"` |
| `window.turnstile?.reset()` | `window.hcaptcha?.reset()` |

The injected field becomes `h-captcha-response`, which `FormData` picks up for
free just the same. Select hCaptcha rather than Turnstile in the Web3Forms
settings.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| No widget appears at all | Script didn't load. Check for `is:inline` (Step 3) and confirm `TURNSTILE_SITE_KEY` is non-empty. View source: the tag should point at Cloudflare's URL, not a bundled `/_astro/…` path. |
| Widget renders, but every submit is rejected | Widget is outside the `<form>`, so the token never submits. Inspect the DOM for `cf-turnstile-response` and check what it's nested inside. |
| Everything works, but `curl` without a token also works | Secret key not saved in the Web3Forms dashboard. Nothing is being verified. |
| First submit fine, second always fails | Missing `turnstile.reset()` on the error paths (Step 5). |
| `Property 'turnstile' does not exist on type 'Window'` | The `env.d.ts` declaration in Step 5. |
| Works locally, fails in production | `housingsupportrides.org` missing from the Turnstile hostname list, or the site hasn't been redeployed since the key was added. |
| `110200` / domain-not-allowed error | Hostname mismatch — the exact host you're loading from isn't on the widget's list (`www.` counts as different). |
