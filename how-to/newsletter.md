# Setting Up an Automated Newsletter

Goal: someone types their email into the site and lands on a list. You publish
a journal post and everyone on that list gets it — without you opening a mail
app, copying a link, or pasting addresses into BCC.

Both halves are achievable, and one of them is already half-built: the site
already publishes an RSS feed at [`src/pages/rss.xml.js`](../src/pages/rss.xml.js),
which is the hook every newsletter service uses to send posts automatically.

Read [deploying.md](./deploying.md) first if the domain isn't pointed at Vercel
yet — Step 2 below depends on DNS, and so does whether your mail lands in the
inbox or in spam.

## What "automated" actually means here

Two separate pieces. People mix them up and then wonder why nothing sends.

| Piece | What it does | How it gets automated |
| --- | --- | --- |
| **Signup** | Visitor enters an email → they're added to the list, get a confirmation email, and can unsubscribe later | A form on the site POSTs to the newsletter service. You never touch the list. |
| **Sending** | A new journal post goes out to the whole list as an email | **RSS-to-email**: the service polls `/rss.xml` on a schedule and mails anything new. You publish; it sends. |

You can have the first without the second (collect emails now, send manually
later). You cannot have the second without the first. Build them in that order.

## Which service?

All of these do signup + RSS-to-email. The differences that matter for a small
nonprofit are the free tier, whether there's a nonprofit discount, and how much
dashboard you have to learn.

| Option | Verdict |
| --- | --- |
| **MailerLite** ← *start here* | Best free tier of the bunch — roughly 1,000 subscribers and 12,000 emails/month at no cost, with RSS campaigns included rather than paywalled. Enough runway that you won't pay for a year or more. Dashboard is busy but learnable. |
| **Buttondown** | The nicest one to work with if you're comfortable with an API — clean, fast, genuinely good deliverability, honest pricing, and an explicit nonprofit discount. Free tier is small (~100 subscribers), so you'll hit the paid plan sooner. Pick this if you value simplicity over free headroom. |
| **Givebutter Engage** | Worth a look *because you're already setting up Givebutter for donations* — donor records and newsletter subscribers stay in one CRM instead of drifting apart. Weaker at RSS-to-email automation, so you'd likely send campaigns by hand. See "The Givebutter question" below. |
| **Mailchimp** | The name everyone knows, and the one I'd pick last. Free tier has shrunk to ~500 contacts, RSS campaigns sit behind a paid plan, and the interface is heavy. The 15% nonprofit discount doesn't close the gap. |
| **Substack / beehiiv** | Built for individual writers building an audience, not for an org newsletter. Substack puts your list on *their* domain with *their* branding and a subscribe wall. Wrong shape for a 501(c)(3). |
| **Resend Broadcasts** | Tempting since you're on Vercel and might already use Resend for forms, but it has no built-in RSS automation — you'd write and host that yourself. Only worth it if you want the whole thing in code. |

⚠️ **Verify the pricing before you commit.** Free tiers on these services change
often, usually downward. The numbers above are a starting point for comparison,
not a quote.

## Step 0 — Three constraints specific to this site

Decide these before you open a signup page anywhere.

1. **Budget is $0 and should stay there for a while.** This is what pushes the
   recommendation toward MailerLite over Buttondown, despite Buttondown being
   the more pleasant tool. A list of 40 people does not justify $9/month yet.

2. **The domain isn't live yet.** Item 1 on the
   [launch punch list](../notes/todo-next-steps.md) is pointing the
   Squarespace-registered domain at Vercel. Until that's done, RSS-to-email has
   nothing real to link to — every "read the full post" link in your email
   would 404. Finish the domain first.

3. **You'll be adding DNS records at Squarespace anyway.** Since you're already
   going into the registrar's DNS panel for Vercel, do the newsletter's email
   authentication records in the same sitting (Step 2). It's the same screen and
   it saves you a second round of "why is everything going to spam."

## Step 1 — Make the list

Sign up, create one list (MailerLite calls them "groups"), and **turn on double
opt-in**. Double opt-in means a new subscriber gets a "confirm your email" click
before they're active.

It costs you maybe 20% of raw signups, and it's worth it every time:

- It's the single best defense against bots stuffing your form with garbage
  addresses, which is what destroys sender reputation.
- It proves consent, which keeps you clear under CAN-SPAM and makes you safe by
  default if you ever email someone in the EU or Canada.
- A list of 200 people who confirmed is worth more than 800 who didn't.

While you're in settings, fill in the **sender name** (`Housing Support Rides`),
**reply-to** (`hsr@housingsupportrides.org`), and the **physical mailing
address** — `1351 3rd St E, Saint Paul, MN 55106`, the same one in the site
footer. The address isn't optional; see "The legal bits" below.

## Step 2 — Authenticate the domain ⚠️ (don't skip this)

Your newsletter service will send mail *claiming to be* `housingsupportrides.org`.
Receiving servers only believe that claim if the domain vouches for the sender
via DNS. Without it, a meaningful share of your mail silently lands in spam, and
you will have no idea it's happening.

The service gives you records to add — typically a few CNAMEs, or a TXT for SPF
plus a CNAME for DKIM. Add them at the **Squarespace registrar's DNS panel**,
alongside the records pointing the domain at Vercel.

Three things worth understanding rather than just pasting:

- **SPF** lists which servers may send as your domain.
- **DKIM** cryptographically signs each message so it can't be forged.
- **DMARC** tells receivers what to do when the first two fail. Start at
  `p=none` (monitor only) so you don't bounce your own legitimate mail while
  things are still settling, then tighten it later.

DNS changes can take a few hours to propagate. Wait for the service's dashboard
to show the domain as verified before sending anything real.

## Step 3 — Put a signup form on the site

### ⚠️ First: the footer can't hold a React form

The obvious home for a signup box is the footer, so it appears on every page.
But look at [`SiteLayout.astro:16-21`](../src/layouts/SiteLayout.astro#L16-L21):

```astro
<!-- Navbar needs JS (scroll state + mobile menu); Footer is static HTML. -->
<Navbar client:load />
<slot />
<Footer />
```

`<Footer />` has **no `client:` directive**, which is deliberate — it's a wall of
links with no interactivity, so Astro renders it to plain HTML and ships zero
JavaScript for it. That's good for performance and bad for your form: a React
component with `useState` and an `onSubmit` dropped inside `Footer.tsx` will
*render* correctly and then do absolutely nothing when clicked. No error, no
warning. It just sits there.

This is the same Astro-vs-React seam described at the end of
[images.md](./images.md). Three ways through it:

| Approach | Trade-off |
| --- | --- |
| Add `client:visible` to `<Footer />` | One-word fix, but now you ship and hydrate the entire footer's JS to every page for one text input. Wasteful. |
| Make the signup its own island, passed into `Footer` as a child | Hydrates only the form. Correct, but adds a React island and some indirection. |
| **Plain `<form>` + a small script** ← *use this* | No React, no hydration, ~40 lines. **Matches what the site already does** for the contact and volunteer forms. |

The third option wins mostly because it's already the house pattern:
[`src/lib/web3forms.ts`](../src/lib/web3forms.ts) is exactly this shape, and
[`contact.astro`](../src/pages/contact.astro) wires it up with a six-line
`<script>`. Copying a pattern that's already here beats introducing a fourth way
to do forms.

### Add the config constant

In [`src/lib/content.ts`](../src/lib/content.ts), next to the other service
keys, following the same empty-gated convention:

```ts
/**
 * Newsletter signup endpoint. Create a list at your email service (MailerLite,
 * Buttondown, …), then paste its form/API endpoint here.
 * Leave blank and the signup form doesn't render at all — nothing breaks.
 */
export const NEWSLETTER_ENDPOINT = ''
```

The empty-string default is the same trick `GIVEBUTTER_ACCOUNT_ID` and
`WEB3FORMS_ACCESS_KEY` use: the site builds and deploys fine unconfigured, and
nobody sees a broken widget in the meantime.

⚠️ **Only use an endpoint that's safe to expose.** This value ships in the
browser bundle. Newsletter services offer a *public* form endpoint for exactly
this purpose — use that one. If the dashboard hands you something labeled a
secret or admin API key, it does **not** belong here; that route needs a server
endpoint instead (see "Doing it in code" at the end).

### Add the helper

New file, `src/lib/newsletter.ts` — deliberately parallel to `web3forms.ts`:

```ts
import { NEWSLETTER_ENDPOINT } from './content'

const statusClass = {
  idle: 'mt-3 text-sm text-[var(--muted-foreground)]',
  success: 'mt-3 text-sm text-[var(--primary)]',
  error: 'mt-3 text-sm text-red-600',
}

/**
 * Wires a newsletter <form> to POST an email address to NEWSLETTER_ENDPOINT.
 * Mirrors initWeb3Form in ./web3forms.ts — same status-element contract,
 * same honeypot idea, same "not configured yet" behaviour.
 */
export function initNewsletterForm(form: HTMLFormElement, statusEl: HTMLElement) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!NEWSLETTER_ENDPOINT) return

    // Honeypot: hidden from real users, irresistible to naive bots.
    if ((form.elements.namedItem('website') as HTMLInputElement | null)?.value) {
      return
    }

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    const email = new FormData(form).get('email')

    if (btn) btn.disabled = true
    statusEl.textContent = 'Signing you up…'
    statusEl.className = statusClass.idle

    try {
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error(String(res.status))

      form.reset()
      // Double opt-in means they are NOT subscribed yet — say so, or they'll
      // assume they're done, never confirm, and quietly never hear from you.
      statusEl.textContent = 'Almost there — check your inbox to confirm.'
      statusEl.className = statusClass.success
    } catch {
      statusEl.textContent = "That didn't go through. Please try again."
      statusEl.className = statusClass.error
    } finally {
      if (btn) btn.disabled = false
    }
  })
}
```

⚠️ **Check your service's expected payload.** Some want JSON (`{ email }`),
some want form-encoded fields, some need a list/group ID alongside the address.
The shape above is the common case, not a universal one — confirm it against
their docs before wondering why every submission fails.

### Add the markup

New file, `src/components/sections/NewsletterSignup.astro`. An `.astro`
component, so it drops into the layout without any hydration question:

```astro
---
import { NEWSLETTER_ENDPOINT } from '../../lib/content'
---

{NEWSLETTER_ENDPOINT && (
  <section class="border-t border-[var(--border)] bg-[var(--card)]">
    <div class="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-16">
      <div>
        <h2 class="font-serif text-2xl text-[var(--foreground)]">Stay in the loop</h2>
        <p class="mt-2 max-w-prose text-sm text-[var(--muted-foreground)]">
          Occasional stories from the road, volunteer openings, and what your
          support made possible. No more than once a month.
        </p>
      </div>

      <form id="newsletter-form" class="w-full max-w-sm">
        <div class="flex gap-2">
          <label class="sr-only" for="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autocomplete="email"
            class="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
          <input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off" />
          <button
            type="submit"
            class="shrink-0 rounded-full bg-[var(--accent-warm)] px-6 py-3 font-semibold text-white transition-all duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign up
          </button>
        </div>
        <p id="newsletter-status" class="mt-3 text-sm text-[var(--muted-foreground)]" role="status"></p>
      </form>
    </div>
  </section>
)}

<script>
  import { initNewsletterForm } from '../../lib/newsletter'

  const form = document.querySelector<HTMLFormElement>('#newsletter-form')
  const status = document.querySelector<HTMLElement>('#newsletter-status')
  if (form && status) initNewsletterForm(form, status)
</script>
```

Note the honeypot here is a **text input** checked for a non-empty value, while
the contact form's is a **checkbox** checked for `checked`. Both work; they just
have to match their helper. Don't copy one and keep the other's check.

Telling people the sending frequency up front ("no more than once a month")
measurably improves signup rates, and it sets an expectation you should then
actually keep.

### Render it

In [`src/layouts/SiteLayout.astro`](../src/layouts/SiteLayout.astro), directly
above the footer:

```astro
---
import NewsletterSignup from '../components/sections/NewsletterSignup.astro'
---

<Navbar client:load />
<slot />
<NewsletterSignup />
<Footer />
```

Site-wide, zero JS until the file actually renders, and invisible until
`NEWSLETTER_ENDPOINT` is set.

Worth also dropping on [`/journal`](../src/pages/journal/index.astro) — someone
who just finished reading a post is the single likeliest person on the site to
subscribe.

## Step 4 — Turn on RSS-to-email

This is the automation you actually asked about, and it's the easy part.

In your service, create an **RSS campaign** (MailerLite: *Campaigns → RSS
campaign*; Buttondown: *Settings → RSS-to-email*) and point it at:

```
https://housingsupportrides.org/rss.xml
```

Then set:

- **Check frequency** — daily is plenty. The feed only changes when you publish.
- **Send condition** — only when there's a new item. Otherwise you mail an empty
  newsletter every day, which is a fast way to get unsubscribed.
- **Template** — the service fills title, content, and link from each feed item.

That's the whole loop: publish a post in Keystatic → it lands in
`src/content/journal/` → Vercel rebuilds → `/rss.xml` regenerates → the service
notices → subscribers get an email. Nothing manual after setup.

### ⚠️ What your feed actually contains right now

Open [`src/pages/rss.xml.js`](../src/pages/rss.xml.js) and look at the item map:

```js
description: post.data.excerpt || post.data.title,
```

There's a `description` but **no `content`** field. So every email your RSS
campaign sends will contain the one-line excerpt and a link — not the post.

That may well be what you want. An excerpt-plus-link newsletter is lighter,
renders identically in every mail client, and pulls readers onto the site where
your donate button lives. Most nonprofits should stop here.

If you want the full post in the email instead:

```bash
npm install sanitize-html markdown-it
npm install -D @types/sanitize-html
```

```js
import sanitizeHtml from 'sanitize-html'
import MarkdownIt from 'markdown-it'

const parser = new MarkdownIt()

// …then, inside the items map, alongside `description`:
content: sanitizeHtml(parser.render(post.body), {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
}),
```

⚠️ **This has a real catch with our posts.** The journal collection accepts
`.mdx` ([`content.config.ts`](../src/content.config.ts)), and `markdown-it`
understands Markdown but not MDX. Any post using a custom component will emit
that component's raw JSX as visible text in the email. If you go this route,
either keep journal posts to plain Markdown syntax, or accept that
component-heavy posts will need a hand-sent campaign.

Given that trade-off, excerpt-plus-link is the better default here.

### ⚠️ Two more feed gotchas

- **Backdating breaks sends.** RSS-to-email services track what they've already
  seen and generally key off item order and publish date. Setting `publishedAt`
  to last month on a post you publish today can mean it's never mailed. Publish
  with today's date and edit the displayed date afterward if you must.
- **Drafts are already handled.** `getCollection('journal', ({ data }) => !data.draft)`
  keeps unfinished posts out of the feed, and therefore out of everyone's inbox.
  Leave that filter alone.

## Step 5 — Test before you trust it

1. Subscribe yourself from the live site. Confirm the double opt-in email
   arrives and the link works.
2. Check where it landed. Inbox is the goal; Promotions is survivable; Spam
   means go back to Step 2.
3. Publish a genuinely trivial journal post and confirm the RSS campaign picks
   it up on its next check.
4. Open the result on a phone. Most of your readers will.
5. Click the unsubscribe link and verify it actually removes you.

Only after all five should you tell anyone the newsletter exists.

## The legal bits (short, but not optional)

CAN-SPAM applies to nonprofits too, and the penalties are per-email.

- **A physical mailing address in every email.** You have one:
  1351 3rd St E, Saint Paul, MN 55106.
- **A working one-click unsubscribe**, honored within 10 business days. Every
  service above handles this for you — just never remove their footer token.
- **Accurate subject lines and From fields.** No "Re:" on a first contact.

⚠️ **Do not import your contact or volunteer form submissions into this list.**
Those people wrote to you about a ride or about driving; they did not ask for a
newsletter. Adding them is a consent problem, and practically it's worse: people
who don't remember signing up hit "mark as spam" instead of "unsubscribe," and
enough of those will poison the deliverability of your whole domain — including
the mail you send from the contact form. Every subscriber should have entered
their own address into the signup box, or ticked a clearly labeled opt-in
checkbox elsewhere.

If you do want to invite existing contacts, send them a one-off personal email
asking them to sign up themselves. Slower, and the only clean way.

## The Givebutter question

Once Givebutter is live, donor contact records live there and newsletter
subscribers live in MailerLite. Two lists, drifting apart.

That's an acceptable cost at your size, and not worth solving on day one. It
starts to matter when you want to send donors something different from what you
send the general list — a year-end appeal, say.

When that day comes, the options are: run the newsletter *out of* Givebutter
Engage and lose easy RSS automation; use Zapier to sync new donors into
MailerLite; or export and import by hand a few times a year. The manual export
is genuinely fine at a few hundred contacts — don't build a sync you don't need.

## Doing it in code instead

If you'd rather own the whole flow: `@astrojs/vercel` is already the adapter in
[`astro.config.mjs`](../astro.config.mjs), so server endpoints work today. You'd
add `src/pages/api/subscribe.ts`, keep the service's secret API key in a Vercel
environment variable instead of in `content.ts`, and POST to your own route from
the form.

Worth it when you need a secret-key-only API, server-side validation, or
subscriber data that shouldn't touch the client. Not worth it just to collect
email addresses — the public endpoint exists for this, and a serverless function
is one more thing to maintain and debug at 11pm before a campaign goes out.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Form does nothing, no console error | The script never ran, or the form is inside a non-hydrated React component. See Step 3's warning. |
| `NEWSLETTER_ENDPOINT is not defined` at build | Constant not exported from `content.ts`, or the import path is wrong. |
| Submissions 400 | Payload shape doesn't match the service — it likely wants form-encoded data or a list ID. |
| Emails land in spam | Domain authentication incomplete or still propagating. Step 2. |
| RSS campaign never fires | `site` not set in `astro.config.mjs`, the domain isn't live yet, or the post is backdated / still `draft: true`. |
| Subscribers say they never got the confirmation | Double opt-in mail going to spam — same fix as Step 2. |
| Email contains raw component text | An MDX post rendered through `markdown-it`. See Step 4. |
