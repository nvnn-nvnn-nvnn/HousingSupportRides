# Learning: Store Another Form, Add an Admin API Route

Two worked examples that follow the code exactly as it's written today
(2026-11-23). Neither is built yet. Follow the steps to build them yourself,
or just read them to understand how the pieces connect.

- **Example 1:** a new "Partner With Us" form whose messages show up in
  `/admin/submissions`, like contact and volunteer messages do.
- **Example 2:** a new admin-only API route: **download all submissions as a
  spreadsheet (CSV)**.

Background: [../notes/admin-system.md](../notes/admin-system.md) (the
middleware, cookies, and the `submission` table).

---

## How a form gets stored today

```
visitor submits /contact
  │
  ├──▶ Web3Forms ──▶ email to the inbox          (the official record)
  │
  └──▶ storeCopy() in src/lib/web3forms.ts
         │  POST /api/submissions  { form: 'contact', name, email, … }
         ▼
       src/pages/api/submissions.ts      (public route, anyone can call it)
         ▼
       saveSubmission() in src/lib/server/submissions.ts
         checks: known form name? honeypot? size limits? 5 per 10 min per visitor?
         ▼
       INSERT INTO submission …          (Turso)
         ▼
       /admin/submissions lists it
```

The key gate: **`saveSubmission` only accepts form names on an allow-list**,
`STORED_FORMS` in `src/lib/server/core.ts`. Anything else gets
"Unknown form". So storing a new form is mostly "add its name everywhere the
list of names appears."

---

## Example 1: Store a "Partner With Us" form

**You'll touch 5 files. No database change needed:** the `submission`
table's `form` column is plain text, and any extra fields go into the `data`
column automatically.

### Step 1: Allow the name (server)

`src/lib/server/core.ts`:

```ts
export const STORED_FORMS = ['contact', 'volunteer', 'partner'] as const
```

`StoredForm` is built from this list, so the type updates by itself.

### Step 2: Fix what TypeScript now complains about

`src/lib/server/submissions.ts`, in `countSubmissions()`, has a hard-coded
object with one entry per form. Add yours:

```ts
const counts: Record<StoredForm, { total: number; week: number }> = {
  contact: { total: 0, week: 0 },
  volunteer: { total: 0, week: 0 },
  partner: { total: 0, week: 0 },
}
```

> 💡 This is TypeScript earning its keep. `Record<StoredForm, …>` means "one
> entry for **every** form name." Add a name in Step 1 and forget this, and
> `npm run build` stops with an error instead of the dashboard silently
> showing nothing. Run `npx astro check` to see it.

### Step 3: Let the browser send it

`src/lib/web3forms.ts` lists the names twice, in `storeAs?:` (line ~33) and
in `storeCopy(form: …)` (line ~41). Change both to:

```ts
'contact' | 'volunteer' | 'partner'
```

> Why not import `StoredForm` from `core.ts`? You *can*, as
> `import type { StoredForm } from './server/core'`. `import type` is erased
> at build time, so no server code reaches the browser. Writing the names out
> is just more obvious for a beginner. Either way works.

### Step 4: Build the form page

Create `src/pages/partner.astro`. The quickest start is to **copy
`src/pages/contact.astro`** and change:

| What | To |
| --- | --- |
| `<PageHeader>` title/lead | "Partner With Us" and a line about partnering |
| form `id`, status `id`, success `id` | `partner-form`, `partner-form-status`, `partner-form-success` |
| hidden `subject` | `New partner enquiry — Housing Support Rides` |
| fields | keep name/email/phone/message; add e.g. `<input name="organization">` |
| the script's last line | `storeAs: 'partner'` |

```astro
<script>
  import { initWeb3Form } from '../lib/web3forms'
  const form = document.querySelector<HTMLFormElement>('#partner-form')
  const status = document.querySelector<HTMLElement>('#partner-form-status')
  const success = document.querySelector<HTMLElement>('#partner-form-success')
  if (form && status) initWeb3Form(form, status, { successEl: success, storeAs: 'partner' })
</script>
```

`organization` isn't one of the four "promoted" fields (name, email, phone,
message), so `saveSubmission` puts it in `data`. The admin page already
displays everything in `data` with a readable label ("Organization").

Then point the footer's "Partner With Us" link at `/partner`
(`INVOLVE_LINKS` in `src/components/layout/Footer.tsx`).

### Step 5: Show it in the dashboard

- `src/pages/admin/submissions.astro`, the `tabs` list:
  ```ts
  { label: 'Partner', href: '/admin/submissions?form=partner', value: 'partner' },
  ```
- `src/pages/admin/index.astro`, the count cards (line ~12):
  ```ts
  { label: 'Partner enquiries', href: '/admin/submissions?form=partner', ...counts.partner },
  ```

### Check it works

1. `npm run dev`, open `/partner`, and send a test message.
2. Sign in locally at `/admin/login`, then go to **Submissions → Partner**. Your
   message is there, with "Organization" shown.
3. `npm run build` passes.
4. The email arrives too. ⚠️ Locally, Web3Forms really sends it, so use
   an obviously fake message.

### ⚠️ The one form you must never store

The **concern form on `/transparency`** is deliberately *not* stored. It
lets someone report unfair treatment, possibly *by staff*, and every admin
can read the dashboard. Never add `'concern'` to `STORED_FORMS`. The comment
at the top of `submissions.ts` explains why.

---

## How an admin API route works today

The only one so far is "delete a submission":
[`src/pages/api/admin/submissions/[id].ts`](../src/pages/api/admin/submissions/[id].ts).

```ts
export const prerender = false                      // 1. run on the server

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (locals.user?.role !== 'admin') {              // 2. check admin AGAIN
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const id = params.id                              // 3. validate input
  if (!id) return new Response(null, { status: 400 })

  const deleted = await deleteSubmission(id)        // 4. do the work (lib/server)
  return new Response(null, { status: deleted ? 204 : 404 })  // 5. honest status
}
```

| Part | Why |
| --- | --- |
| File under `src/pages/api/admin/` | The address becomes `/api/admin/…`, which the middleware already guards. |
| `export const prerender = false` | Without it, the route is built once at build time, which is useless for an API and unsafe. |
| The function name `DELETE` / `GET` / `POST` | It's the HTTP method this route answers. A file can export several. |
| `locals.user?.role !== 'admin'` | The middleware put the signed-in user in `locals`. **Check again here anyway**, in case someone edits the middleware. |
| Database work lives in `src/lib/server/` | Routes stay short, and the same function can be reused by pages. |

---

## Example 2: "Download all submissions as CSV"

A button on `/admin/submissions` that downloads a spreadsheet file. It's
useful for the board's records, and a good first route because it's
**read-only**: it can't damage anything.

### Step 1: Create the route

`src/pages/api/admin/export.csv.ts` creates the address `/api/admin/export.csv`.

```ts
/**
 * Download every stored submission as a CSV file. Admin only.
 * Middleware guards /api/admin/*; this route checks again on purpose.
 */
import type { APIRoute } from 'astro'
import { listSubmissions } from '../../../lib/server/submissions'

export const prerender = false

/**
 * One spreadsheet cell, made safe:
 * - wrap in quotes and double any quotes inside (the CSV rule), and
 * - ⚠️ if it starts with = + - @, put a ' in front. Otherwise Excel treats
 *   a visitor's message like "=HYPERLINK(...)" as a FORMULA. Form text comes
 *   from strangers, so this matters ("CSV injection").
 */
function cell(value: unknown): string {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export const GET: APIRoute = async ({ locals }) => {
  if (locals.user?.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 })
  }

  const rows = await listSubmissions({ limit: 500 })   // 500 = the helper's maximum

  const header = ['Date', 'Form', 'Name', 'Email', 'Phone', 'Message', 'Other fields']
  const lines = rows.map((s) =>
    [
      s.createdAt.toISOString(),
      s.form,
      s.name,
      s.email,
      s.phone,
      s.message,
      Object.entries(s.data).map(([k, v]) => `${k}: ${v}`).join('; '),
    ]
      .map(cell)
      .join(','),
  )
  const csv = [header.map(cell).join(','), ...lines].join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      // "attachment" = download it, don't show it in the tab.
      'content-disposition': `attachment; filename="submissions-${today}.csv"`,
      // Personal data: don't let any cache keep a copy.
      'cache-control': 'no-store',
    },
  })
}
```

### Step 2: Add the button

`src/pages/admin/submissions.astro`, under the intro paragraph:

```astro
<a
  href="/api/admin/export.csv"
  class="mt-4 inline-flex rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--accent-soft)]"
>
  Download all as CSV
</a>
```

A plain link works because it's a `GET`, and the browser sends your sign-in
cookie automatically.

### Check it works

1. Signed in locally: click the button and a `.csv` file downloads. Open it
   in Excel or Google Sheets.
2. **Signed out** (or in a private window): visit
   `http://localhost:4321/api/admin/export.csv`. You get sent to the login
   page, or a 401. **Never the data.**
3. Send a test contact message whose text is `=1+1`. In the spreadsheet it
   must show as `'=1+1` (text), **not** `2`.
4. `npm run build`, then confirm no file appears as static output:
   ```bash
   find dist/client -path "*export*"   # must print nothing
   ```

---

## Rules for any new admin route (checklist)

- [ ] Lives under `src/pages/api/admin/` (so the middleware covers it).
- [ ] `export const prerender = false`.
- [ ] Checks `locals.user?.role !== 'admin'` itself, first thing.
- [ ] **Reading → `GET`. Changing anything → `POST`, `PATCH` or `DELETE`, never
      `GET`.** A `GET` can be triggered just by someone getting an admin to
      click a link. The sign-in cookie is `SameSite=Lax`, which blocks other
      sites from sending it on `POST`/`DELETE`, but not on a clicked link.
- [ ] Treats every input (`params`, body, query string) as hostile: check
      it exists, its type, and its length.
- [ ] SQL uses `?` placeholders with `args: […]`. **Never** build SQL by
      gluing strings together (SQL injection).
- [ ] Returns honest status codes: `200`/`201`/`204` OK, `400` bad input, `401`
      not allowed, `404` not found.
- [ ] Personal data responses: `cache-control: no-store`.
- [ ] Database code goes in `src/lib/server/`, not in the route.
- [ ] Note it in `notes/admin-system.md` and `notes/CHANGELOG.md`.

---

## Try it yourself (exercises)

1. **Easy:** add a "Volunteer only" option to the CSV: `/api/admin/export.csv?form=volunteer`.
   Hint: `url.searchParams.get('form')`, `isStoredForm()`, and
   `listSubmissions({ form })`. Copy how `admin/submissions.astro` does it.
2. **Medium:** a "Delete all older than 1 year" button. It **changes data**, so
   it must be a `POST` (see the checklist). Write the SQL helper in
   `submissions.ts`: `DELETE FROM submission WHERE createdAt < ?`. Hint:
   copy how the existing delete button calls `fetch(…, { method: 'DELETE' })`.
   This is also how the board's "how long to keep messages" decision would
   be enforced.
3. **Harder:** "Mark as handled." This needs a **new column**
   (`handled INTEGER DEFAULT 0`), so `db:migrate` must add it to existing
   databases (`ALTER TABLE`), plus a `PATCH` route and a checkbox in the
   list. Plan it on paper first: what happens to the live Turso database
   that already has rows?

Want a check? Ask Claude to **review** your branch against this guide.
