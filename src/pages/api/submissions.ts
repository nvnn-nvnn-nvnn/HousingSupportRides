/**
 * PUBLIC endpoint: the contact and volunteer forms post a copy here so it
 * shows up in /admin. Anyone on the internet can call this, so it validates,
 * caps sizes, and rate-limits by a salted IP hash — see
 * src/lib/server/submissions.ts.
 *
 * Failure here is non-fatal for the visitor: the form still emails via
 * Web3Forms, and src/lib/web3forms.ts ignores errors from this route.
 */
import type { APIRoute } from 'astro'
import { isServerConfigured } from '../../lib/server'
import { saveSubmission } from '../../lib/server/submissions'

export const prerender = false

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!isServerConfigured()) return json({ error: 'Not configured' }, 503)

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Expected JSON' }, 415)
  }

  // Cheap guard before parsing: refuse anything wildly larger than a real form.
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > 64 * 1024) return json({ error: 'Too large' }, 413)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const result = await saveSubmission(body, clientAddress)
  return result.ok ? json({ ok: true }, 201) : json({ error: result.error }, result.status)
}
