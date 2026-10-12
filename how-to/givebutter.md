# Connecting Givebutter (Donations)

Goal: turn the Donate button on the homepage into a real checkout.

You write no code. The integration is built, and **half of it is already
configured** — see "Where this stands" below.

## ✅ Where this stands (as of 2026-10-12)

| Value | State |
| --- | --- |
| `GIVEBUTTER_ACCOUNT_ID` | ✅ **Set** to `zJRFTUL0GGxyXOtx`, from the embed snippet on the Integrations page. |
| `GIVEBUTTER_CAMPAIGN_CODE` | ✅ **Set** to `support-stable-housing-and-rides-for-neighbors-l3x49o` (the full slug — see below). |

**Both values are in, and the build output is correct:**

```html
<script async src="https://widgets.givebutter.com/latest.umd.cjs?acct=zJRFTUL0GGxyXOtx&p=other">
...
<givebutter-button campaign="support-stable-housing-and-rides-for-neighbors-l3x49o" class="…">
```

The disabled placeholder is gone (zero occurrences). `&p=other` is carried over
from Givebutter's own snippet; it appears as `&amp;p=other` in raw HTML, which
is correct attribute escaping.

### ⚠️ The campaign code is the WHOLE slug, not the suffix

This cost a debugging round, so it's worth stating flatly.

The campaign URL is `givebutter.com/support-stable-housing-and-rides-for-neighbors-l3x49o`.
The trailing `l3x49o` *looks* exactly like a 6-character campaign code, and it
was tried first. **It's wrong.** The code is the entire slug.

How to settle it in one command, rather than guessing — ask Givebutter which
URL exists:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://givebutter.com/<candidate>
```

For this campaign:

| Candidate | Result |
| --- | --- |
| `l3x49o` | **404** — not a campaign |
| `support-stable-housing-and-rides-for-neighbors-l3x49o` | **200** ✅ |

Whichever returns 200 is the campaign code.

### ⚠️ How a wrong code fails: the button vanishes

Not an error, not a broken-looking button — **nothing at all.**

With a bad code, Givebutter's script finds no campaign and renders nothing, so
`<givebutter-button>` collapses to an empty element. The markup is still there
and still looks correct in view-source, which is exactly what makes it
confusing: **inspecting the HTML cannot detect this.** Only the URL check above,
or a click, can.

So if the Donate button is *missing* rather than misbehaving, suspect the
campaign code first.

### How the button path was verified

Before the real account ID existed, the full wiring was dummy-tested by
temporarily setting `GIVEBUTTER_ACCOUNT_ID = 'TESTACCT'` and
`GIVEBUTTER_CAMPAIGN_CODE = 'TEST99'`, building, inspecting the output, then
reverting. All three checks passed:

| Check | Result |
| --- | --- |
| Widget script loads from Givebutter's CDN, not bundled | ✅ `src="https://widgets.givebutter.com/latest.umd.cjs?acct=TESTACCT"` |
| Real custom element renders | ✅ `<givebutter-button campaign="TEST99" class="…">` with live orange styling |
| Disabled placeholder removed | ✅ zero occurrences |

That's why the campaign code is a one-line change: the path it switches on is
already known to work. Repeat this test the same way if you ever need to.

### Why that first check mattered

**Astro processes `<script>` tags by default** — it bundles and rewrites them.
If it had done that to Givebutter's tag, the script would have been served from
our own `/_astro/` bundle instead of Givebutter's CDN, the custom element would
never register, and you'd get the silently-dead button described in Step 3.

It's safe because of where it sits in
[`BaseLayout.astro:89-96`](../src/layouts/BaseLayout.astro#L89-L96):

```astro
{
  GIVEBUTTER_ACCOUNT_ID && (
    <script
      async
      src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${GIVEBUTTER_ACCOUNT_ID}`}
    />
  )
}
```

The tag is inside a **conditional expression**, which Astro can't statically
analyse, so it passes it through verbatim. ⚠️ **If you ever move this script
out of the `{…}` expression** — e.g. "simplifying" it to a plain top-level
`<script>` — add `is:inline` or it will be bundled and the button will break
silently. (Same mechanism explained in
[form-spam-protection.md](./form-spam-protection.md) Step 3.)

## What's already built

| Piece | Where | State |
| --- | --- | --- |
| Widget script loader | [`BaseLayout.astro:89-96`](../src/layouts/BaseLayout.astro#L89-L96) | ✅ Gated on the account ID |
| Donate button | [`DonateBlock.tsx:139-159`](../src/components/sections/DonateBlock.tsx#L139-L159) | ✅ Gated on the campaign code |
| TypeScript types for the custom elements | [`src/types/givebutter.d.ts`](../src/types/givebutter.d.ts) | ✅ `givebutter-button`, `givebutter-goal-bar` |
| Donation tiers + impact copy | `DONATION_TIERS` in [`content.ts`](../src/lib/content.ts) | ✅ 4 tiers: $25 / $60 / $150 / $400 |

## Step 1 — The two values (both already set)

From the Givebutter dashboard:

| Value | Where to find it | Looks like | State |
| --- | --- | --- | --- |
| **Account ID** | Dashboard → **Settings → Integrations**, inside the embed snippet as `?acct=…` | `zJRFTUL0GGxyXOtx` | ✅ done |
| **Campaign Code** | The **entire** slug from the campaign's public URL | `support-stable-…-l3x49o` | ✅ set |

### ⚠️ Ignore the platform integrations

The Integrations page lists Wix, Squarespace, WordPress, Shopify and others.
**None of them apply.** They're plugins for sites *built on* those platforms;
this site is custom Astro on Vercel. The only thing you need from that page is
the generic **embed script**, and the `?acct=` value inside it is the account ID.

### ⚠️ The campaign code is NOT on the Integrations page

This is where people get stuck — they go back to Integrations looking for it.
It isn't there. It belongs to the campaign, not the account. Open the campaign's
public page and read the slug off the end of the URL:

```
https://givebutter.com/abc123
                       ^^^^^^  ← this is the campaign code
```

**Whatever the slug is, that's the code — take the whole thing.** Long and
readable, short and random, or a readable name with a random suffix: it all
goes in verbatim.

⚠️ **Do not try to extract a "real" short code out of a longer slug.** That
guess was made here once (taking `l3x49o` out of
`support-stable-housing-and-rides-for-neighbors-l3x49o`) and it was wrong — the
button silently vanished. If you're unsure, don't reason about it, just curl
both and see which returns 200.

One account can have several campaigns, each with its own code — which is why
the two values are separate and not interchangeable. See Step 3.

## Step 2 — Where they live

[`src/lib/content.ts`](../src/lib/content.ts), lines 43–44 — both already
filled in:

```ts
export const GIVEBUTTER_ACCOUNT_ID = 'zJRFTUL0GGxyXOtx'  // ← set
export const GIVEBUTTER_CAMPAIGN_CODE = 'support-stable-housing-and-rides-for-neighbors-l3x49o'
```

That's the entire code change. Both are public, client-side values — safe to
commit, same as `WEB3FORMS_ACCESS_KEY`.

## Step 3 — ⚠️ Set BOTH, or you get a button that silently does nothing

The one real trap, and it fails in the worst possible way.

The two values gate two *different* things:

- `GIVEBUTTER_ACCOUNT_ID` loads the widget script, which is what **defines** the
  `<givebutter-button>` custom element.
- `GIVEBUTTER_CAMPAIGN_CODE` switches `DonateBlock` from the disabled
  placeholder to rendering `<givebutter-button>`.

| Account ID | Campaign Code | What the visitor gets |
| --- | --- | --- |
| blank | blank | Greyed-out disabled button. Honest. |
| **set** | **blank** | Still the disabled button. Script loads, does nothing visible. Harmless — **this is where the site is now.** |
| **blank** | **set** | 🚨 **A normal-looking button that does nothing when clicked.** |
| set | set | ✅ Real checkout popup. |

That third row is the dangerous one. `<givebutter-button>` with no script loaded
is just an unknown HTML tag — the browser renders its children (the heart icon
and the label) as ordinary inline content, so it looks like a working button.
No error, nothing in the console, and **no signal to you or the donor that the
click did nothing.** Someone trying to give you money can't, and you never find
out.

**Set them together, and test by clicking — never by looking.**

## Step 4 — Rebuild

```bash
npm run build
```

Both values are module constants **inlined at build time**, not read at
runtime. The live site won't have them until Vercel redeploys. Same gotcha as
the Web3Forms key.

## Step 5 — Test it properly

1. `npm run dev`, homepage, scroll to `#donate`.
2. **Click the button.** A Givebutter checkout popup should open. Nothing
   happens → re-read Step 3.
3. Confirm the popup shows **your** campaign, not blank or wrong — that's what
   validates the campaign code.
4. Change the amount tier and check the button label updates. That's local
   state, but it proves you're on the real component, not the placeholder.
5. Use Givebutter's test/demo facility if your account has one before putting a
   real card through. If you do make a live test donation, refund it from the
   dashboard.
6. Redeploy, then repeat step 2 **on production**.

Step 2 and step 6 are the only checks that mean anything. The build passing
proves the values are *present*, not that checkout *works*.

## ⚠️ Before accepting real money: the tax-deductibility claim

Standing TODO at
[`DonateBlock.tsx:160-161`](../src/components/sections/DonateBlock.tsx#L160-L161):

```tsx
{/* TODO: confirm 501(c)(3) status and add the real EIN before accepting
    donations. Do NOT claim tax-deductibility until verified. */}
```

The copy under the button currently reads *"Housing Support Rides, Inc. is a
nonprofit organization based in Saint Paul, Minnesota"* — accurate, and makes no
tax claim. **Leave it until 501(c)(3) status and the EIN are confirmed.**

A fabricated "501(c)(3) · EIN 45-2810394" line was removed from this section
once already (see [CHANGELOG.md](../notes/CHANGELOG.md)). Donors deduct on the
strength of that claim and the IRS cares whether it's true — a materially
different class of risk from a typo. Add it when you can prove it.

While you're there: the four **impact sentences** in `DONATION_TIERS`
("covers a week of rides…", "stocks a move-in kit…") are specific factual
claims about what money buys. Check they're true.

## Optional: the goal bar

`givebutter-goal-bar` is already typed, so a progress bar is a drop-in once the
script is loading:

```astro
<givebutter-goal-bar campaign={GIVEBUTTER_CAMPAIGN_CODE} />
```

Only worth it if the campaign has a goal set in Givebutter. Don't ship a bar
sitting at 0%.

## If Givebutter stays painful

Setup was a sticking point from 2026-09-19
([todo-next-steps.md](../notes/todo-next-steps.md) item 2). It isn't
load-bearing — both values are empty-gated, so the site builds and deploys fine
without it, and the disabled button is honest rather than broken.

Swapping processors is contained, almost entirely inside `DonateBlock.tsx`:

| Alternative | Why consider it |
| --- | --- |
| **Zeffy** | **No platform fee for nonprofits** — donors optionally cover it. Cheapest by a wide margin. |
| **Donorbox** | Same widget-embed model, often easier setup. |
| **Stripe payment link** | Crudest, most reliable: one hosted URL, no widget script, no custom elements. Loses the tier/impact UI, but takes money today. |

If launch is blocked on this, the Stripe link is the pragmatic unblock — point
the button's `href` at it and move on. Revisit the nicer integration after
you're live.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Button greyed out and unclickable | `GIVEBUTTER_CAMPAIGN_CODE` still blank. That's the intended placeholder. |
| Button looks normal, clicking does nothing | 🚨 Campaign code set, account ID blank. Step 3. |
| Works locally, dead on the live site | Not redeployed since adding the values (build-time inlining). |
| **Donate button missing entirely** (absent, not broken) | Wrong campaign code — the widget found no campaign and rendered nothing. The HTML still looks correct, so inspect won't catch it. Use the curl check in Step 1. |
| Popup opens on a blank or wrong campaign | Wrong campaign code. Take the **whole** slug, not a piece of it. See Step 1. |
| Nothing from `widgets.givebutter.com` in the Network tab | Account ID blank, so `BaseLayout` never renders the script tag. View source and search for it. |
| Script URL points at `/_astro/…` instead of Givebutter | The script tag was moved out of its `{…}` conditional and Astro bundled it. Restore the expression, or add `is:inline`. |
| `Property 'givebutter-button' does not exist` | Shouldn't happen — types live in `src/types/givebutter.d.ts`. Check the file still exists. |
