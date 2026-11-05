/**
 * Form submissions, stored so admins can see them in /admin.
 *
 * Web3Forms still emails every submission — the database is a second copy for
 * the dashboard, not a replacement. Email remains the record of truth.
 *
 * ⚠️ CONCERN REPORTS ARE NOT STORED, deliberately. The /transparency concern
 * form exists so someone can report unfair treatment, possibly BY a staff
 * member — which is why it has its own Web3Forms key routed to a board member.
 * A dashboard every admin can read would undo that: the report would land in
 * front of the person it is about. If that ever changes, it needs its own
 * access rule, not just a row in this table. See how-to/admin-dashboard.md.
 */
import { getDb, getHashSalt } from './index'
import { STORED_FORMS, type StoredForm } from './core'

export interface Submission {
  id: string
  form: StoredForm
  name: string | null
  email: string | null
  phone: string | null
  message: string | null
  /** Every other submitted field, e.g. the volunteer role checkboxes. */
  data: Record<string, string>
  createdAt: Date
}

// Limits on the public endpoint. Generous for a human, tight for a script.
const MAX_FIELDS = 30
const MAX_FIELD_LENGTH = 5000
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5

/** Fields that are plumbing, not content — never stored. */
const DROP_FIELDS = new Set(['access_key', 'botcheck', 'subject', 'form'])
const PROMOTED = ['name', 'email', 'phone', 'message'] as const

export function isStoredForm(value: unknown): value is StoredForm {
  return typeof value === 'string' && (STORED_FORMS as readonly string[]).includes(value)
}

async function hashIp(ip: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${getHashSalt()}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export type SaveResult =
  | { ok: true }
  | { ok: false; status: number; error: string }

/**
 * Validate and store one submission. Input is whatever the browser sent, so
 * treat every field as hostile: unknown shape, unbounded length.
 */
export async function saveSubmission(input: unknown, ip: string): Promise<SaveResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, status: 400, error: 'Invalid body' }
  }
  const body = input as Record<string, unknown>

  if (!isStoredForm(body.form)) return { ok: false, status: 400, error: 'Unknown form' }

  // Honeypot: real users never tick the hidden box. Report success so a bot
  // gets no signal that it was caught.
  if (body.botcheck === true || body.botcheck === 'on' || body.botcheck === 'true') {
    return { ok: true }
  }

  const fields = Object.entries(body).filter(([key]) => !DROP_FIELDS.has(key))
  if (fields.length > MAX_FIELDS) return { ok: false, status: 413, error: 'Too many fields' }

  const clean: Record<string, string> = {}
  for (const [key, value] of fields) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed === '') continue
    if (key.length > 100 || trimmed.length > MAX_FIELD_LENGTH) {
      return { ok: false, status: 413, error: 'Field too long' }
    }
    clean[key] = trimmed
  }

  const db = getDb()
  const ipHash = await hashIp(ip)
  const since = Date.now() - RATE_WINDOW_MS
  const recent = await db.execute({
    sql: 'SELECT COUNT(*) AS n FROM submission WHERE ipHash = ? AND createdAt > ?',
    args: [ipHash, since],
  })
  if (Number(recent.rows[0]?.n ?? 0) >= RATE_MAX) {
    return { ok: false, status: 429, error: 'Too many submissions' }
  }

  const promoted: Record<(typeof PROMOTED)[number], string | null> = {
    name: null,
    email: null,
    phone: null,
    message: null,
  }
  for (const key of PROMOTED) {
    promoted[key] = clean[key] ?? null
    delete clean[key]
  }

  await db.execute({
    sql: `INSERT INTO submission (id, form, name, email, phone, message, data, ipHash, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      body.form,
      promoted.name,
      promoted.email,
      promoted.phone,
      promoted.message,
      JSON.stringify(clean),
      ipHash,
      Date.now(),
    ],
  })

  return { ok: true }
}

function rowToSubmission(row: Record<string, unknown>): Submission {
  let data: Record<string, string> = {}
  try {
    data = JSON.parse(String(row.data ?? '{}'))
  } catch {
    // A corrupt data column shouldn't take the whole dashboard down.
  }
  return {
    id: String(row.id),
    form: row.form as StoredForm,
    name: (row.name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    message: (row.message as string | null) ?? null,
    data,
    createdAt: new Date(Number(row.createdAt)),
  }
}

export async function listSubmissions(options: { form?: StoredForm; limit?: number } = {}) {
  const limit = Math.min(Math.max(options.limit ?? 200, 1), 500)
  const result = options.form
    ? await getDb().execute({
        sql: 'SELECT * FROM submission WHERE form = ? ORDER BY createdAt DESC LIMIT ?',
        args: [options.form, limit],
      })
    : await getDb().execute({
        sql: 'SELECT * FROM submission ORDER BY createdAt DESC LIMIT ?',
        args: [limit],
      })
  return result.rows.map((row) => rowToSubmission(row as unknown as Record<string, unknown>))
}

export async function countSubmissions() {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const result = await getDb().execute({
    sql: `SELECT form, COUNT(*) AS total, SUM(CASE WHEN createdAt > ? THEN 1 ELSE 0 END) AS week
          FROM submission GROUP BY form`,
    args: [weekAgo],
  })
  const counts: Record<StoredForm, { total: number; week: number }> = {
    contact: { total: 0, week: 0 },
    volunteer: { total: 0, week: 0 },
  }
  for (const row of result.rows) {
    if (isStoredForm(row.form)) {
      counts[row.form] = { total: Number(row.total), week: Number(row.week ?? 0) }
    }
  }
  return counts
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const result = await getDb().execute({ sql: 'DELETE FROM submission WHERE id = ?', args: [id] })
  return result.rowsAffected > 0
}
