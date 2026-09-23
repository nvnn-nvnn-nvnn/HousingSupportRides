# Form Success & Error Screens

Goal: when someone sends the contact or volunteer form, they should be in no
doubt about whether it worked.

This covers what's now built, why it's shaped the way it is, and how to change
the wording or add the same treatment to a new form.

Related: [deploying.md](./deploying.md) for connecting Web3Forms in the first
place, and [form-spam-protection.md](./form-spam-protection.md) for keeping bots
out of the inbox.

## What it does now

| Outcome | What the visitor sees |
| --- | --- |
| **Sending** | Button disables, "Sending…" under it |
| **Success** | The entire form is replaced by a confirmation panel — check mark, heading, what happens next, and a "send another" button |
| **Failure** | The form stays exactly as it was, **with everything still typed into it**, plus a red error banner |
| **Not configured** | A plain note that the form isn't connected yet (see [deploying.md](./deploying.md)) |

## Why it's built this way

### The old behavior was close to useless

Before this, every outcome changed the same line of small grey text under the
submit button. That's a real problem on a phone: the button is under your thumb,
near the bottom of the viewport, and the status line often sits *below the fold*.
A successful send and a silently broken one looked the same — you press send,
nothing visibly happens.

For a form that carries ride requests and volunteer applications, "did that
work?" is the one question the interface has to answer.

### Success and failure are deliberately asymmetric ⚠️

This is the design decision worth understanding before you change anything.

- **Success hides the form.** There is nothing left to interact with, so there's
  no ambiguity and no way to double-submit by pressing send again.
- **Failure keeps the form, and keeps the input.** Note what
  [`web3forms.ts`](../src/lib/web3forms.ts) does *not* do on the error path: it
  never calls `form.reset()`. That's on purpose.

If a send fails because of a dropped connection and we clear a message someone
spent five minutes writing, they don't retype it. They leave, and we never learn
the enquiry existed. Preserving input on failure costs nothing and is the
difference between a recoverable error and a lost person.

⚠️ **If you touch the error path, don't add a reset to it.** It looks tidy. It
is not.

## How the pieces fit

Three files, with a clear split:

| File | Owns |
| --- | --- |
| [`components/common/FormResult.astro`](../src/components/common/FormResult.astro) | What the success panel *looks like* and says. No logic. Ships hidden. |
| [`lib/web3forms.ts`](../src/lib/web3forms.ts) | All behavior — submitting, swapping the panel in, error banners, focus. |
| The page (e.g. [`contact.astro`](../src/pages/contact.astro)) | Wiring the two together, and the page-specific copy. |

The panel is an **`.astro` component, not React**. It has no state and no event
handlers of its own — `initWeb3Form` does everything — so there's no island and
no JavaScript shipped for it. Worth remembering when you're tempted to reach for
`.tsx` by reflex; see the hydration discussion in
[newsletter.md](./newsletter.md) for when that reflex actively breaks things.

### The grid swap, which is nicer than it looks

On `/contact`, the form and the contact details `<aside>` are siblings in a
two-column grid, and the success panel is a third sibling between them.

You'd expect that to break the layout. It doesn't, because both the form and the
panel toggle with Tailwind's `hidden`, which is `display: none` — and **an
element with `display: none` doesn't create a grid item at all**. So:

- Panel hidden → grid items are `[form, aside]` → form in column 1.
- Panel shown, form hidden → grid items are `[panel, aside]` → panel in column 1.

The panel lands exactly where the form was, with no layout code. If you ever
swap `hidden` for something like `opacity-0` or `invisible`, this quietly breaks
— those still occupy their grid cell, and you'll get an empty column.

## Changing the wording

Everything visitor-facing is a prop on the page, not buried in the component:

```astro
<FormResult
  id="contact-form-success"
  title="Thank you — your message is on its way."
  body="We've received it, and someone will get back to you within a couple of business days. If it's urgent, call us at (763) 501-7764."
/>
```

The volunteer form passes its own copy plus `resetLabel="Submit another application"`.

Two things worth keeping in whatever you write:

- **A concrete expectation.** "Within a couple of business days" is better than
  "soon," and an escape hatch (phone number, spam-folder warning) is better than
  nothing when someone is anxious about a ride.
- **Honesty.** Don't promise a response time nobody is staffed to hit. A missed
  promise is worse than a vague one.

Pass `resetLabel={null}` to drop the "send another" button entirely.

## Adding this to a new form

Four steps. Using a hypothetical partner-enquiry form:

**1.** Give the form an id and a status element, as the existing forms do:

```astro
<form id="partner-form" class="grid gap-5">
  <!-- fields -->
  <button type="submit">Send</button>
  <p id="partner-form-status" class="mt-3 text-sm text-[var(--muted-foreground)]" role="status"></p>
</form>
```

**2.** Add the panel *as a sibling of the form*, not inside it:

```astro
<FormResult id="partner-form-success" title="Thanks for reaching out." body="…" />
```

⚠️ **Inside the form and it disappears with it**, because hiding the form hides
everything it contains. You get a successful send and a blank space.

**3.** Wire them up:

```astro
<script>
  import { initWeb3Form } from '../lib/web3forms'

  const form = document.querySelector<HTMLFormElement>('#partner-form')
  const status = document.querySelector<HTMLElement>('#partner-form-status')
  const success = document.querySelector<HTMLElement>('#partner-form-success')
  if (form && status) initWeb3Form(form, status, { successEl: success })
</script>
```

**4.** Add a hidden `subject` field so you can tell the forms apart in your
inbox — the existing two use
`New contact form message — Housing Support Rides` and
`New volunteer interest — Housing Support Rides`.

The `successEl` option is optional. Leave it off and the form falls back to the
old single-line status message — fine for something trivial, not for anything
you'd be sorry to lose.

## Accessibility notes

Three deliberate details, each of which matters to someone:

- **`role="status"` + `aria-live="polite"`** on the panel, so a screen reader
  announces the confirmation when it appears rather than leaving the user to
  discover it.
- **`tabindex="-1"` and an explicit `.focus()`.** When the form vanishes, focus
  would otherwise be sitting on a removed submit button and fall back to the top
  of the document. Moving it to the panel keeps keyboard users oriented. The
  `tabindex="-1"` is what makes a `<div>` focusable programmatically without
  putting it in the tab order.
- **`focus({ preventScroll: true })`, then a separate `scrollIntoView`.**
  Focusing an off-screen element scrolls the page instantly and jarringly.
  Doing it in two steps gives a smooth scroll — and that scroll is skipped
  entirely when the visitor has `prefers-reduced-motion` set.

## Testing it

The success path is easy to see and the failure path is the one that actually
needs checking, so test that one deliberately:

1. **Success** — submit a real message. The form should vanish, the panel appear
   and be scrolled to, and "send another" should bring back an empty form.
2. **Failure, with input preserved** — open devtools → Network → set **Offline**,
   fill the form out properly, and submit. You should get the red banner, and
   **everything you typed should still be there**. This is the regression most
   worth guarding.
3. **Server-side rejection** — temporarily set `WEB3FORMS_ACCESS_KEY` to a
   nonsense string. Web3Forms rejects it and its own message surfaces in the
   banner. Put the real key back afterwards.
4. **Keyboard only** — tab to submit, press Enter, and check focus lands on the
   panel rather than jumping to the top of the page.
5. **On a phone**, which is the case that motivated all of this.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Form disappears, nothing replaces it | Panel is *inside* the `<form>`. Move it out to be a sibling. |
| Success shows the old one-line message instead of the panel | `successEl` not passed, or the `id` doesn't match the `querySelector`. |
| Panel appears in the wrong grid column | Something in the chain uses `invisible`/`opacity-0` instead of `hidden`, so a hidden element is still holding its cell. |
| Typed input is lost after a failed send | A `form.reset()` crept into the error path. Remove it — see the asymmetry section. |
| Page jumps hard to the panel | `preventScroll: true` missing from the `.focus()` call. |
| "Send another" does nothing | The button lost its `data-form-reset` attribute, which is how the handler finds it. |
