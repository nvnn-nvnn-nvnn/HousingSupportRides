# Using the Admin (Keystatic CMS)

The admin is a friendly web editor for the journal. It reads and writes the same
MDX files a developer would edit by hand — there is no separate database.

## Opening it

```bash
npm run dev
```
Then go to **http://localhost:4321/keystatic**.

You'll see the **Journal** collection. From here you can create, edit, and delete
posts with a rich editor — no Markdown knowledge required.

## How saving works (important)

This project uses Keystatic in **local mode** (`storage: { kind: 'local' }` in
[`keystatic.config.tsx`](../keystatic.config.tsx)). That means:

- **Save = write a file** into `src/content/journal/` on the computer running
  `npm run dev`. There is no cloud yet.
- Changes are **not shared** until you **commit them to git and push**.
- So the workflow is: edit in `/keystatic` → save → `git add/commit/push`.

This is perfect for a developer or one person publishing locally. To let
non-technical staff publish from their own browser **without running the code**,
switch Keystatic to **GitHub mode** (or Keystatic Cloud) at deploy time — see
[deploying.md](./deploying.md#letting-staff-edit-in-production).

## Drafts

- Toggle **Draft** on to keep a post out of the public site and the list.
- Drafts still save as files (with `draft: true`); they're just filtered out by
  the site (`getCollection('journal', ({data}) => !data.draft)`).
- Flip it off and save when you're ready to publish.

## Images

- The cover field is a **path** to an image you place in the `public/` folder,
  e.g. put `public/img/muddy-fork.jpg` and set the cover to `/img/muddy-fork.jpg`.
- Always fill in **cover alt text** for accessibility.
- No cover? The article shows a styled placeholder — the site still works.

## Categories

The category dropdown is defined in `keystatic.config.tsx`. To add or rename
options, edit the `category` field's `options` there **and** keep the site happy
(the value is just shown as a label, so any string is fine to render).

## If the admin won't load
- Make sure you ran `npm run dev` (the admin needs the dev server; it is **not**
  part of the static public build).
- It lives at `/keystatic` exactly — not `/admin`.
- Still stuck? `npm run build` surfaces config errors in `keystatic.config.tsx`.
