/**
 * Admin gate. Runs before every ON-DEMAND request.
 *
 * ⚠️ It does NOT run for prerendered (static) pages at request time — those
 * are plain files on a CDN. So every page under /admin MUST declare
 * `export const prerender = false`, or it is built as public HTML and this gate
 * never sees the request. There is no error when that happens. Verify with
 * `npm run build` — no admin page may appear as an .html file in dist/client.
 * See how-to/admin-dashboard.md, "The prerender trap".
 *
 * This is the first line of defence, not the only one: every /api/admin route
 * re-checks the role itself. Hiding something here is not authorization.
 */
import { defineMiddleware } from 'astro:middleware'
import { getAuth, ServerNotConfiguredError } from './lib/server'

/** Pages under /admin that must stay reachable without a session. */
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/login/'])

function needsAdmin(path: string): boolean {
  if (PUBLIC_ADMIN_PATHS.has(path)) return false
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path.startsWith('/api/admin/') ||
    // Keystatic is gated too, so content editing sits behind the same login.
    // In production Keystatic ALSO requires a GitHub login to save — this gate
    // is in addition to that, not instead of it.
    path === '/keystatic' ||
    path.startsWith('/keystatic/') ||
    path.startsWith('/api/keystatic')
  )
}

/** Paths where we want to know who's signed in, even if not required. */
function wantsSession(path: string): boolean {
  return needsAdmin(path) || PUBLIC_ADMIN_PATHS.has(path)
}

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null
  context.locals.session = null

  // Static pages: built ahead of time, nothing to check, and the database may
  // not even be reachable at build time.
  if (context.isPrerendered) return next()

  const path = context.url.pathname
  if (!wantsSession(path)) return next()

  try {
    const result = await getAuth().api.getSession({ headers: context.request.headers })
    context.locals.user = result?.user ?? null
    context.locals.session = result?.session ?? null
  } catch (error) {
    if (error instanceof ServerNotConfiguredError) {
      console.error(error.message)
      return new Response(
        'The admin area is not configured yet. See how-to/admin-dashboard.md.',
        { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      )
    }
    throw error
  }

  if (needsAdmin(path) && context.locals.user?.role !== 'admin') {
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
    return context.redirect(`/admin/login?next=${encodeURIComponent(path)}`)
  }

  return next()
})
