# Archive

Built, working pages that are **not currently on the site**. Nothing in this
folder is served, built, or type-checked — it sits outside `src/`, so Astro
never sees it.

## To restore a page

Move it back into `src/pages/` **unchanged**:

```bash
mv archive/get-help.astro src/pages/get-help.astro
```

Its imports (`../layouts/SiteLayout.astro` and so on) are written relative to
`src/pages/`, which is why they look broken from here and work again the moment
the file is back where it belongs. Don't "fix" them while it is archived.

Then link it — a page with no link is live but unreachable. Add it to
`NAV_LINKS` in `src/lib/content.ts` for the top bar, or to the footer.

## What is here

### `get-help.astro` — 2026-09-21

A front door for people who need a ride or housing, built while restructuring
the site against the conversion patterns of plannedgiving.charitywater.org.
Archived the same night when the navigation change it came with was reverted.

What it does:

- **One dominant action, repeated.** The phone number, large, at the top and
  again at the foot of the page — for someone in crisis, calling beats a form.
- **Objections, not logistics.** Seven reasons people talk themselves out of
  calling ("I'm not sure I qualify", "I've been turned down elsewhere", "I don't
  have ID or an address right now", "Who finds out?"), each with a short answer.
- **An honest exit.** 211, 911 and 988 for anyone HSR cannot help — consistent
  with the program description's commitment to route people to existing services.

It asserts nothing unverified. It does not say rides are free and does not name
a service area; both are still unconfirmed, so both are phrased as "ask us."
Program text is pulled from `PROGRAM_DESCRIPTION`, so it stays verbatim.

**Why it may be worth restoring:** the site currently has no page for the people
it exists to serve. Someone who needs a ride reaches the same generic contact
form as a vendor or a volunteer. The page does not depend on the nav change it
was archived alongside — it can go back on its own, linked from wherever you
like, without touching the navigation at all.
