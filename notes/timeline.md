# Project Timeline

How the Housing Support Rides website got built, from start to now. One line
per milestone. For the full detail of any date, see
[CHANGELOG.md](./CHANGELOG.md); for what's left, see
[todo-next-steps.md](./todo-next-steps.md).

**Keep it updated:** when something big lands (a launch step, a new
feature, a decision), add one line under the right month. Small fixes
belong only in the CHANGELOG.

---

## At a glance

```
Aug 2026   Foundation      Astro site, rebrand, first pages
Sep 2026   Real content    Real mission/programs, gallery photos, forms, donations
Oct 2026   Trust           Givebutter live, leadership bios, accountability page
Nov 2026   Ownership       Admin sign-in, blog editor, photos everywhere, domain live
           → Launch        Admins set up and handed the site (in progress)
```

---

## August 2026: the foundation

| Date | Milestone |
| --- | --- |
| 2026-08-15 | Moved from a Vite React app to **Astro**, with a blog and the Keystatic editor. Rebranded "Riverbend Foundation" → **Housing Support Rides**. Brand logo, maroon theme, Volunteer / History / FAQ / Contact pages. |
| 2026-08-19 | First git commit of the Astro site. |
| 2026-08-29 | Real organization details from the NPI registry. "What We Do" page, a page per way to get involved, a content pass. |
| 2026-08-30 | Pushed to GitHub. |

## September 2026: real content

| Date | Milestone |
| --- | --- |
| 2026-09-01 | **Vercel deploys fixed** (the adapter must be `vercel()`). Mobile navbar fixes. |
| 2026-09-15 | Givebutter donation integration (code). |
| 2026-09-16 | **Forms work:** Contact + one Volunteer form via Web3Forms. |
| 2026-09-20 | **Real mission and program text** replaces the placeholder draft. **32 real event photos**, a gallery with a zoomable lightbox. New logo badge. `/recovery-meetings`. Decided: hide invented numbers, don't fill them. |
| 2026-09-21 | Founder's letter on /history. Journal reset to one real post. Lightbox arrow keys. |
| 2026-09-22 | Hero rebuilt for readability, forms show a real success screen, photo releases signed (gallery restored), first journal post published. |

## October 2026: trust

| Date | Milestone |
| --- | --- |
| 2026-10-12 | **Givebutter live.** Leadership bios, the accountability page, hero polish. The 911 wording was revised. |

## November 2026: the organization owns it

| Date | Milestone |
| --- | --- |
| 2026-11-04 | **Admin dashboard built:** sign-in (Better Auth), form submissions, adding/removing admins. |
| 2026-11-05 | Security: Astro upgraded to 7.3.8. |
| 2026-11-08 | **Keystatic Cloud** set up in code, so staff can write posts without GitHub accounts. |
| 2026-11-09 | **Hero slideshow:** five photos, crossfading. |
| 2026-11-10 | Decision: **stay on Turso, not Supabase.** Image upload buttons in the blog editor. |
| 2026-11-12 | **Support Us redesign:** photo slideshow beside the Donate button. |
| 2026-11-13 | Pushed: everything above goes live on Vercel. |
| 2026-11-16 | **Photos everywhere:** "Out in the Community" mosaic, photo cards and headers, redesigned sign-up and contact forms. `npm run img`. |
| 2026-11-18 | **Domain confirmed live:** `www.housingsupportrides.org`. Admin pages removed from the sitemap. 📘 Learning section + dark mode project. |
| 2026-11-23 | Pushed: photos, forms, domain fixes. Learning guide: storing forms + admin API routes. |
| 2026-11-24 | Plain-English answers documented. **Admin launch, Phase 1 started:** Turso database created, secret key made. **Keystatic Cloud turned on** (`hsr-admin/housingsupportrides`, commit f6b65b1). GitHub repo found to have moved to `nvnn-nvnn-nvnn/HousingSupportRides`. |

---

## Admin launch progress

Tracks [admin-launch-checklist.md](../how-to/admin-launch-checklist.md).
Tick the date in when each phase is done.

| Phase | What | Status |
| --- | --- | --- |
| 0 | Site deployed, address noted | ✅ 2026-11-18 |
| 1 | Admin sign-in on the live site (Turso, Vercel settings, first admin) | 🔄 started 2026-11-24 (database ✅, secret key ✅) |
| 2 | Add two or more admins | ⬜ |
| 3 | Keystatic Cloud, so admins can write posts | 🔄 project `hsr-admin/housingsupportrides` created + pushed 2026-11-24 (invites + test post ⬜) |
| 4 | Hand over (guides sent to admins) | ⬜ |
| 5 | Domain ✅ 2026-11-18 · ownership on every service ⬜ · board decisions ⬜ | 🔄 |

---

## Still ahead (from todo-next-steps.md)

- Finish the admin launch (above).
- Real captions for the photo mosaic; confirm "Mileage is covered".
- Newsletter isn't connected yet (it shows a false confirmation).
- Spam protection for the forms (Turnstile).
- 📘 Dark mode, a learning project the user is building.
