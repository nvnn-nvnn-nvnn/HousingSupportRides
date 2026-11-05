/**
 * Delete one stored submission. Admin only.
 *
 * Middleware already blocks non-admins on /api/admin/*, and this route checks
 * AGAIN. That's deliberate: authorization belongs in the endpoint itself. If
 * the middleware matcher is ever edited and stops covering this path, the
 * endpoint must not silently become public.
 */
import type { APIRoute } from 'astro'
import { deleteSubmission } from '../../../../lib/server/submissions'

export const prerender = false

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (locals.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const id = params.id
  if (!id) return new Response(null, { status: 400 })

  const deleted = await deleteSubmission(id)
  return new Response(null, { status: deleted ? 204 : 404 })
}
