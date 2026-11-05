/**
 * Better Auth's HTTP handler: sign-in, sign-out, session, and the admin
 * plugin's user-management endpoints all live under /api/auth/*.
 * Public sign-up is disabled in src/lib/server/core.ts.
 */
import type { APIRoute } from 'astro'
import { getAuth } from '../../../lib/server'

export const prerender = false

export const ALL: APIRoute = ({ request }) => getAuth().handler(request)
